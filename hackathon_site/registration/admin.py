from django.contrib import admin
from registration.models import Application, Team as TeamApplied


class ApplicationInline(admin.TabularInline):
    model = Application
    autocomplete_fields = ("user",)
    extra = 0


@admin.register(TeamApplied)
class TeamAppliedAdmin(admin.ModelAdmin):
    search_fields = ("id", "team_code")
    inlines = (ApplicationInline,)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    autocomplete_fields = ("user", "team")
    list_display = ("get_full_name", "team", "school")
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "team__team_code",
    )
    list_filter = ("school",)

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    get_full_name.short_description = "User"
