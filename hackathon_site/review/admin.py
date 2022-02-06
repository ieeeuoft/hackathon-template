from django.contrib import admin, messages
from django.core.cache import cache
from django.core.exceptions import PermissionDenied
from django.db.models import Count, Max
from django.db import transaction
from django.urls import reverse, path
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from import_export import resources
from import_export.admin import ExportMixin

from django.http import HttpResponseRedirect

from registration.models import Application
from review.forms import ReviewForm, ApplicationReviewInlineFormset
from review.models import Review, TeamReview
from review.views import MailerView


class ReviewResource(resources.ModelResource):
    class Meta:
        model = Review
        fields = (
            "application__user__first_name",
            "application__user__last_name",
            "application__user__email",
            "application__user__username",
            "application__team__team_code",
            "reviewer__email",
            "interest",
            "experience",
            "quality",
            "reviewer_comments",
            "status",
            "decision_sent_date",
            "created_at",
            "updated_at",
        )
        export_order = tuple(fields)

    def get_export_headers(self):
        export_headers = [
            "first_name",
            "last_name",
            "email",
            "username",
            "team_code",
            "reviewer_email",
            "interest",
            "experience",
            "quality",
            "reviewer_comments",
            "status",
            "decision_sent_date",
            "created_at",
            "updated_at",
        ]
        return export_headers


@admin.register(Review)
class ReviewAdmin(ExportMixin, admin.ModelAdmin):
    resource_class = ReviewResource
    list_display = ("get_user", "status", "decision_sent_date", "get_reviewer")
    list_filter = (
        "status",
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

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("application", "application__user", "reviewer")
        )


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
        "get_submission_date",
        "get_is_reviewed",
    )
    list_filter = (TeamReviewedListFilter,)
    inlines = (ApplicationInline,)
    change_list_template = "review/change_list.html"
    readonly_fields = ("team_code",)

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["has_change_permission"] = self.has_change_permission(request)
        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .prefetch_related(
                "applications", "applications__review", "applications__user"
            )
            .annotate(members_count=Count("applications", distinct=True))
            .annotate(most_recent_submission=Max("applications__updated_at"))
        )

    def get_members_count(self, obj):
        return obj.members_count

    get_members_count.short_description = "Members"
    get_members_count.admin_order_field = "members_count"

    def get_is_reviewed(self, obj):
        return all(
            hasattr(application, "review") for application in obj.applications.all()
        )

    get_is_reviewed.boolean = True
    get_is_reviewed.short_description = "Reviewed"

    def get_submission_date(self, obj):
        return obj.most_recent_submission

    get_submission_date.short_description = "Submission date"
    get_submission_date.admin_order_field = "most_recent_submission"

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

    def assign_to_team_view(self, request):
        """
        Assign the current user to the next team with no reviewer assigned.
        Teams are ordered by the most recently submitted application on that team
        ascending, so teams with all applications submitted earlier get reviewed
        first.

        Each user can be assigned as a reviewer to one team. When that user
        requests a new team, they are unassigned from the previous one. The assignment
        will expire after 20 minutes.
        """

        if not self.has_change_permission(request):
            raise PermissionDenied

        active_reviewers_set_cache_key = "admin:assign_to_team:active_reviewers"

        def build_reviewer_assignment_cache_key(user_id):
            """
            Build a key that stores which team a reviewer is assigned to
            """
            return f"admin:assign_to_team:user-{user_id}"

        with transaction.atomic():
            # Set of reviewers IDs that are currently reviewing
            active_reviewers = cache.get(active_reviewers_set_cache_key, set())

            # Get a dictionary mapping user id -> assigned team
            assigned_teams = cache.get_many(
                [
                    build_reviewer_assignment_cache_key(user_id)
                    for user_id in active_reviewers
                ]
            )

            current_user_cache_key = build_reviewer_assignment_cache_key(
                request.user.id
            )

            queryset = (
                self.get_queryset(request)
                .filter(applications__isnull=False)  # Exclude any teams that are empty
                # Get any team where at least one application is missing a review
                .filter(applications__review__isnull=True)
                .exclude(
                    id__in=list(assigned_teams.values())
                )  # Exclude teams that are currently assigned
                .order_by(
                    "most_recent_submission"
                )  # Ascending order, annotated in self.get_queryset
            )

            team = queryset.first()

            if team is None:
                # No more teams left to review
                cache.delete(current_user_cache_key)

                messages.add_message(
                    request,
                    messages.INFO,
                    "No more teams remaining. Note that some reviews may still be in progress, "
                    "so check back later to ensure all were completed",
                )

                return HttpResponseRedirect(
                    reverse("admin:review_teamreview_changelist")
                )

            # Assign the user to their team in the cache, 20 minute TTL
            cache.set(current_user_cache_key, team.id, timeout=60 * 20)

            # Add the user to the set of active reviewers
            active_reviewers.add(request.user.id)

            # Update the active reviewers cache set, 20 minute TTL
            cache.set(
                active_reviewers_set_cache_key, active_reviewers, timeout=60 * 20,
            )

        team_review_page = reverse(
            "admin:review_teamreview_change", kwargs={"object_id": team.id}
        )
        return HttpResponseRedirect(team_review_page)

    def get_urls(self):
        urls = super().get_urls()
        new_urls = [
            path(
                "assign/",
                self.admin_site.admin_view(self.assign_to_team_view, cacheable=True),
                name="assign-reviewer-to-team",
            ),
            path(
                "send-mail/",
                self.admin_site.admin_view(MailerView.as_view(), cacheable=False),
                name="send-decision-emails",
            ),
        ]
        return new_urls + urls
