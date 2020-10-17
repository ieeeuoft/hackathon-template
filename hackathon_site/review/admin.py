from django.contrib import admin
from django.db.models import Count
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _

from registration.models import Application
from review.forms import ReviewForm, ApplicationReviewInlineFormset
from review.models import Review, TeamReview


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("get_user", "status", "decision_sent_date", "get_reviewer")
    list_filter = (
        ("decision_sent_date", admin.EmptyFieldListFilter),
        ("reviewer", admin.RelatedOnlyFieldListFilter),
    )
    search_fields = (
        "application__user__first_name",
        "application__user__last_name",
        "application__user__email",
        "reviewer__first_name",
        "reviewer__last_name",
        "reviewer__email",
    )
    autocomplete_fields = ("reviewer", "application")

    def get_user(self, obj):
        return f"{obj.application.user.first_name} {obj.application.user.last_name}"

    get_user.short_description = "User"
    get_user.admin_order_field = "application__user__first_name"

    def get_reviewer(self, obj):
        return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"

    get_reviewer.short_description = "Reviewer"
    get_reviewer.admin_order_field = "reviewer__first_name"


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
        - review.view_review

        Note that permissions to view a registration team (registration.view_team) is not actually
        required, since it is assumed that the use of this view will be coupled with the ability
        to view and submit reviews.

        Further, note that without registration.change_review permission, the actual review fields
        won't be rendered at all. This is a limitation of the way we add extra review fields to the
        Application inline through a form - without change permissions, the form is not rendered
        at all. Users may still view reviews through their respective admin page.

    In order to view and submit reviews on this page, users must have the following permissions:
        - registration.view_application
        - review.view_review
        - review.change_review
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
