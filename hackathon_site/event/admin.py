from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db.models import Count
from import_export import resources
from import_export.admin import ExportMixin

from event.models import Profile, Team as EventTeam, User
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
        )
        export_order = tuple(fields)

    def get_export_headers(self):
        export_headers = ["First Name", "Last Name", "Email", "Account Confirmed"]
        return export_headers


@admin.register(User)
class EnhancedUser(ExportMixin, UserAdmin):
    resource_class = UserResource
    list_display = UserAdmin.list_display + ("is_active",)


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


# Register your models here.
admin.site.register(Profile)
