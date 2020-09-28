from django import forms
from django.contrib import admin
from django.db.models import Count
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from registration.models import Application
from review.models import Review, TeamReview

admin.site.register(Review)


class ReviewForm(forms.ModelForm):
    int_choices = [("", None)] + [(str(i), i) for i in range(0, 11)]

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
        choices=[("", None)] + Review.STATUS_CHOICES, required=True
    )
    reviewer_comments = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3, "cols": 25}), required=False
    )

    class Meta:
        model = Application
        # fields = "__all__"
        fields = (
            "quality",
            "interest",
            "experience",
            "status",
            "reviewer_comments",
        )

    def __init__(self, *args, **kwargs):
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

        # Once a decision has been sent, changing the review is no longer allowed
        if self.instance.review.decision_sent_date and self.changed_data:
            raise forms.ValidationError(
                _(
                    "Reviews cannot be changed after a decision has been sent. "
                    "Revert changes, or leave and return to this page to reset all fields. "
                    f"Modified fields: {','.join(field for field in self.changed_data)}."
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
            for attr, value in data.items():
                setattr(review, attr, value)

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
    def _construct_form(self, i, **kwargs):
        """
        Pass the request down into the form, so we can use it to set the reviewer.
        ``self.request`` is set by ``ApplicationInline.get_formset()`
        """
        form = super()._construct_form(i, **kwargs)
        form.request = self.request
        return form


class ApplicationInline(admin.TabularInline):
    model = Application
    autocomplete_fields = ("user",)
    extra = 0
    form = ReviewForm
    formset = ApplicationReviewInlineFormset
    can_delete = False
    max_num = 0
    exclude = (
        "user",
        "gender",
        "ethnicity",
        "phone_number",
        "resume",
        "rsvp",
        "conduct_agree",
        "data_agree",
    )
    readonly_fields = (
        "get_user_full_name",
        "study_level",
        "school",
        "graduation_year",
        "q1",
        "q2",
        "q3",
        "get_resume_link",
        "birthday",
        "get_reviewer_name",
        "get_decision_sent_date",
    )

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    get_user_full_name.short_description = "Full Name"

    def get_resume_link(self, obj):
        link = '<a href="{}" target="_blank">Open resume</a>'.format(obj.resume.url)
        return mark_safe(link)

    get_resume_link.short_description = "Resume"

    def get_reviewer_name(self, obj):
        if hasattr(obj, "review") and obj.review.reviewer:
            return f"{obj.review.reviewer.first_name} {obj.review.reviewer.last_name}"

        return ""

    get_reviewer_name.short_description = "Reviewer name"

    def get_decision_sent_date(self, obj):
        if hasattr(obj, "review") and obj.review.decision_sent_date:
            return obj.review.decision_sent_date

        return ""

    get_decision_sent_date.short_description = "Decision sent date"

    def get_formset(self, request, obj=None, **kwargs):
        """
        Pass the request into the formset, so that we can then pass it down
        into the form. Request is used to set the reviewer to the current user.
        """
        formset = super().get_formset(request, obj, **kwargs)
        formset.request = request
        return formset

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user", "review")

    def has_change_permission(self, request, obj=None):
        """
        Let users with change_review permissions use this inline, rather than the default
        change_application. Viewing still requires registration.view_application.
        """
        return request.user.has_perm("review.change_review")


class TeamReviewedListFilter(admin.SimpleListFilter):
    title = _("Team Reviewed")
    parameter_name = "reviewed"

    def lookups(self, request, model_admin):
        return [("true", _("Reviewed")), ("false", _("Not reviewed"))]

    def queryset(self, request, queryset):
        queryset = queryset.annotate(num_reviews=Count("applications__review"))
        if self.value() == "true":
            # Teams where all applications have been reviewed
            # In python land, we can easily see whether all applications have a
            # review. In SQL, it's easier to see if the count of applications and
            # reviews are equal.
            return queryset.filter(num_reviews=Count("applications"))
        elif self.value() == "false":
            # Teams where at least one application has no review
            return queryset.filter(num_reviews__lt=Count("applications"))


@admin.register(TeamReview)
class TeamReviewAdmin(admin.ModelAdmin):
    """
    Admin view for reviewing applications of teams. This is the recommended way to review
    applications.

    Applications for each user on the team are displayed in the Applications inline.
    Review fields are set by the ``ReviewForm`` above, and are added to the corresponding
    review object for the application.

    In order to view applications on this page, users must have the following permissions:
        - registration.view_application
        - registration.view_review

        Note that permissions to view a registration team (registration.view_team) is not actually
        required, since it is assumed that the use of this view will be coupled with the ability
        to view and submit reviews.

        Further, note that without registration.change_review permission, the actual review fields
        won't be rendered at all. This is a limitation of the way we add extra review fields to the
        Application inline through a form - without change permissions, the form is not rendered
        at all. Users may still view reviews through their respective admin page.

    In order to view and submit reviews on this page, users must have the following permissions:
        - registration.view_application
        - registration.view_review
        - registration.change_review
    """

    search_fields = ("id", "team_code")
    list_display = (
        "team_code",
        "get_members_count",
        "get_is_reviewed",
    )
    list_filter = (TeamReviewedListFilter,)
    inlines = (ApplicationInline,)
    readonly_fields = ("team_code",)

    def get_members_count(self, obj):
        return obj.applications.count()

    get_members_count.short_description = "Members"

    def get_is_reviewed(self, obj):
        return all(
            hasattr(application, "review") for application in obj.applications.all()
        )

    get_is_reviewed.boolean = True
    get_is_reviewed.short_description = "Reviewed"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related(
                "applications", "applications__review", "applications__user"
            )
        )

    def has_view_permission(self, request, obj=None):
        """
        Any user with review change or view permission can view the team review page
        """
        return request.user.has_perm("review.view_review") or request.user.has_perm(
            "review.change_review"
        )

    def has_change_permission(self, request, obj=None):
        """
        Any user with review change permission can change reviews via the team review page
        """
        return request.user.has_perm(f"review.change_review")

    def has_add_permission(self, request):
        """
        Adding teams isn't supported through the team review page. Use the regular
        team page instead.
        """
        return False

    def has_delete_permission(self, request, obj=None):
        """
        Deleting teams isn't supported through the team review page. Use the regular
        team page instead.
        """
        return False
