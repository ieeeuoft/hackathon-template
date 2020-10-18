import datetime

from django import forms
from django.utils.translation import gettext_lazy as _

from registration.models import Application
from review.models import Review


class ReviewForm(forms.ModelForm):
    int_choices = [(None, "")] + [(i, str(i)) for i in range(0, 11)]

    interest = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    quality = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    experience = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    status = forms.ChoiceField(
        choices=[(None, "")] + Review.STATUS_CHOICES, required=True
    )
    reviewer_comments = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3, "cols": 25}), required=False
    )

    class Meta:
        model = Application
        fields = (
            "quality",
            "interest",
            "experience",
            "status",
            "reviewer_comments",
        )

    def __init__(self, request, *args, **kwargs):
        self.request = request

        super().__init__(*args, **kwargs)

        if hasattr(self.instance, "review"):
            # Pre-populate form fields with existing values
            self.fields["interest"].initial = self.instance.review.interest
            self.fields["experience"].initial = self.instance.review.experience
            self.fields["quality"].initial = self.instance.review.quality
            self.fields["status"].initial = self.instance.review.status
            self.fields["reviewer_comments"].initial = (
                self.instance.review.reviewer_comments or ""
            )

    def _save_m2m_and_review(self):
        """
        Used to make sure the review instance gets saved if commit=False.

        The standard implementation of .save() is to set
        ``self.save_m2m = self._save_m2m``, so that the user can call it
        at a later time. We append ``self._save_m2m`` to also save the review
        instance.
        """
        super()._save_m2m()
        self.review.save()

    def clean(self):
        cleaned_data = super().clean()

        if not hasattr(self.instance, "review"):
            return cleaned_data

        # If the user has been accepted or rejected and a decision sent, their review
        # cannot be changed.
        # If the user was previously waitlisted, they can be re-reviewed (and their
        # decision sent date should be cleared elsewhere if the status has changed)
        if (
            self.instance.review.decision_sent_date
            and self.instance.review.status != "Waitlisted"
            and self.changed_data
        ):
            raise forms.ValidationError(
                _(
                    "Reviews cannot be changed after a decision has been sent. "
                    "Revert changes, or leave and return to this page to reset all fields. "
                    f"Modified fields: {', '.join(field for field in self.changed_data)}."
                ),
                code="decision_sent",
            )

        return cleaned_data

    def save(self, commit=True):
        """
        Though this form is linked to an Application instance, it's actually
        used to save the corresponding review instance.
        """

        data = {
            "reviewer": self.request.user,
            "interest": int(self.cleaned_data["interest"]),
            "experience": int(self.cleaned_data["experience"]),
            "quality": int(self.cleaned_data["quality"]),
            "reviewer_comments": self.cleaned_data["reviewer_comments"],
            "status": self.cleaned_data["status"],
        }

        review = getattr(self.instance, "review", None)

        if review is None:
            data["application"] = self.instance
            review = Review(**data)
        else:
            old_status = review.status

            for attr, value in data.items():
                setattr(review, attr, value)

            # If they were previously waitlisted and the status has been changed to
            # accepted or rejected, allow sending a new decision by clearing
            # decision_sent_date
            if old_status == "Waitlisted" and review.status != old_status:
                review.decision_sent_date = None

        if commit:
            review.save()
        else:
            self.review = review

            # If commit=False, super().save(commit=False) will set
            # self.save_m2m = self._save_m2m, for the user to call at a later time.
            # This will now also save the review instance.
            self._save_m2m = self._save_m2m_and_review

        return super().save(commit)


class ApplicationReviewInlineFormset(forms.BaseInlineFormSet):
    def get_form_kwargs(self, index):
        """
        Pass the request down into the form, so we can use it to set the reviewer.
        ``self.request`` is set by ``ApplicationInline.get_formset()`
        """
        kwargs = super().get_form_kwargs(index)
        kwargs.update({"request": self.request})
        return kwargs


class MailerForm(forms.Form):
    date_start = forms.DateField(
        label="Start date",
        initial=datetime.date.today,
        widget=forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"}),
    )
    date_end = forms.DateField(
        label="End date",
        initial=datetime.date.today,
        widget=forms.DateInput(format="%Y-%m-%d", attrs={"type": "date"}),
    )
    status = forms.ChoiceField(
        label="Applicant statuses to send to",
        choices=[
            ("", ""),
            ("Accepted", "Accepted"),
            ("Waitlisted", "Waitlisted"),
            ("Rejected", "Rejected"),
        ],
    )
    quantity = forms.IntegerField(label="Maximum number of emails to send", initial=100)
