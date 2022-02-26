from django.contrib import admin
from django.db.models import Count

from event.models import Profile, Team as EventTeam
from hardware.admin import OrderInline


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
