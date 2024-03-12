from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count
from import_export import resources
from import_export.admin import ExportMixin

from event.models import Profile, Team as EventTeam, User, UserActivity
from hardware.admin import OrderInline

admin.site.unregister(User)


class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "is_active",
            "application__id",
            "application__review__status",
        )
        export_order = tuple(fields)

    def get_export_headers(self):
        export_headers = [
            "First Name",
            "Last Name",
            "Email",
            "Account Confirmed",
            "Application ID",
            "Review Status",
        ]
        return export_headers


@admin.register(User)
class EnhancedUser(ExportMixin, UserAdmin):
    list_display = UserAdmin.list_display + (
        "is_active",
        "get_application_status",
        "get_review_status",
    )
    resource_class = UserResource

    def get_application_status(self, obj):
        return "Applied" if obj.application.id is not None else "Not Applied"

    get_application_status.short_description = "Application Status"

    def get_review_status(self, obj):
        return obj.application.review.status

    get_review_status.short_description = "Review Status"

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("application", "application__review")
        )

    def get_export_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("application", "application__review")
        )


@admin.register(EventTeam)
class EventTeamAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "team_code",
        "get_members_count",
        "created_at",
    )
    list_display_links = ("id", "team_code")
    search_fields = (
        "id",
        "team_code",
    )
    inlines = (OrderInline,)

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .annotate(members_count=Count("profiles", distinct=True))
        )

    @admin.display(description="Members", ordering="Members")
    def get_members_count(self, obj):
        return obj.members_count


@admin.register(UserActivity)
class UserActivityAdmin(ExportMixin, admin.ModelAdmin):
    list_display = (
        "get_user_name",
        "sign_in",
        "lunch1",
        "dinner1",
        "breakfast2",
        "lunch2",
    )

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    get_user_name.short_description = "Name"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user")

    def get_export_queryset(self, request):
        return super().get_queryset(request).select_related("user")


# Register your models here.
admin.site.register(Profile)
