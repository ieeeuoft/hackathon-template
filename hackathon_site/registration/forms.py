from dateutil.relativedelta import relativedelta
import re

from captcha.fields import ReCaptchaField
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.utils.translation import gettext_lazy as _
from django_registration import validators
from django.conf import settings

from hackathon_site.utils import is_registration_open
from registration.models import Application, Team, User
from registration.widgets import MaterialFileInput


class SignUpForm(UserCreationForm):
    """
    Form for registering a new user account.

    Similar to django_registration's ``RegistrationForm``, but doesn't
    require a username field. Instead, email is a required field, and
    username is automatically set to be the email. This is ultimately
    simpler than creating a custom user model to use email as username.
    """

    captcha = ReCaptchaField(label="")
    error_css_class = "invalid"

    class Meta(UserCreationForm.Meta):
        fields = [
            User.get_email_field_name(),
            "first_name",
            "last_name",
            "password1",
            "password2",
        ]
        labels = {
            User.get_email_field_name(): _("Email"),
            "first_name": _("First Name"),
            "last_name": _("Last Name"),
            "password1": _("Password"),
            "password2": _("Confirm Password"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        email_field = User.get_email_field_name()
        self.fields[email_field].validators.extend(
            (
                validators.HTML5EmailValidator(),
                validators.validate_confusables_email,
                validators.CaseInsensitiveUnique(
                    User, email_field, "This email is unavailable"
                ),
            )
        )
        self.label_suffix = ""

        # This overrides the default labels set by UserCreationForm
        for field, label in self._meta.labels.items():
            self.fields[field].label = label

        for field in self._meta.fields:
            self.fields[field].required = True

    def clean_email(self):
        return self.cleaned_data["email"].lower()

    def save(self, commit=True):
        """
        Set the user's username to their email when saving

        This is much simpler than the alternative of creating a
        custom user model without a username field, but a caveat
        nonetheless.
        """

        user = super().save(commit=False)
        user.username = self.cleaned_data["email"]
        if commit:
            user.save()
        return user


class ApplicationForm(forms.ModelForm):
    error_css_class = "invalid"

    class Meta:
        model = Application
        fields = [
            "birthday",
            "gender",
            "ethnicity",
            "phone_number",
            "school",
            "study_level",
            "graduation_year",
            "resume",
            "q1",
            "q2",
            "q3",
            "conduct_agree",
            "data_agree",
        ]
        widgets = {
            "birthday": forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"}),
            "school": forms.Select(
                # Choices will be populated by select2
                attrs={"class": "select2-school-select"},
                choices=((None, ""),),
            ),
            "resume": MaterialFileInput(),
            "q1": forms.Textarea(
                attrs={
                    "class": "materialize-textarea",
                    "placeholder": "I enjoy cake",
                    "data-length": 1000,
                }
            ),
            "q2": forms.Textarea(
                attrs={
                    "class": "materialize-textarea",
                    "placeholder": "Cake is wonderful",
                    "data-length": 1000,
                }
            ),
            "q3": forms.Textarea(
                attrs={
                    "class": "materialize-textarea",
                    "placeholder": "I could really go for cake right now",
                    "data-length": 1000,
                }
            ),
            "phone_number": forms.TextInput(attrs={"placeholder": "+1 (123) 456-7890"}),
            "graduation_year": forms.NumberInput(attrs={"placeholder": 2020}),
        }

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop("user")
        super().__init__(*args, **kwargs)
        self.label_suffix = ""
        self.fields["conduct_agree"].required = True
        self.fields["data_agree"].required = True

    def clean(self):
        if not is_registration_open():
            raise forms.ValidationError(
                _("Registration has closed."), code="registration_closed"
            )

        cleaned_data = super().clean()
        if hasattr(self.user, "application"):
            raise forms.ValidationError(
                _("User has already submitted an application."), code="invalid"
            )
        return cleaned_data

    def clean_birthday(self):
        latest_birthday = (
            settings.EVENT_START_DATE - relativedelta(years=settings.MINIMUM_AGE)
        ).date()
        user_birthday = self.cleaned_data["birthday"]
        if user_birthday > latest_birthday:
            raise forms.ValidationError(
                _(f"You must be {settings.MINIMUM_AGE} to participate."),
                code="user_is_too_young_to_participate",
            )
        return self.cleaned_data["birthday"]

    def save(self, commit=True):
        self.instance = super().save(commit=False)
        team = Team.objects.create()

        self.instance.user = self.user
        self.instance.team = team
        self.instance.phone_number = re.sub("[^0-9]", "", self.instance.phone_number)

        if commit:
            self.instance.save()
            self.save_m2m()

        return self.instance


class JoinTeamForm(forms.Form):
    team_code = forms.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.label_suffix = ""
        self.error_css_class = "invalid"

    def clean(self):
        if not is_registration_open():
            raise forms.ValidationError(
                _("You cannot change teams after registration has closed."),
                code="registration_closed",
            )

        return super().clean()

    def clean_team_code(self):
        team_code = self.cleaned_data["team_code"]

        try:
            team = Team.objects.get(team_code=team_code)
        except Team.DoesNotExist:
            raise forms.ValidationError(_(f"Team {team_code} does not exist."))

        if team.applications.count() >= Team.MAX_MEMBERS:
            raise forms.ValidationError(_(f"Team {team_code} is full."))

        return team_code
