import csv
import functools

from django.contrib import admin
from django.http import HttpResponse
from django.core.exceptions import ObjectDoesNotExist

from registration.models import Application, Team as TeamApplied


def rgetattr(obj, attr, *args):
    """
    Recursive getattr, allows for nested attributes.
    For example if you're in the Application class, you can't do getattr for user.first_name
    But with rgetattr you can.
    """

    def _getattr(obj, attr):
        return getattr(obj, attr, *args)

    return functools.reduce(_getattr, [obj] + attr.split("."))


class ApplicationInline(admin.TabularInline):
    model = Application
    autocomplete_fields = ("user",)
    extra = 0


class ExportCsvMixin:
    export_fields = []

    def export_as_csv(self, request, queryset):
        # Setup export_field_names and export_field_attributes arrays
        export_field_names, export_field_attributes = list(zip(*self.export_fields))

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename={}.csv".format(
            self.model._meta
        )
        writer = csv.writer(response)

        writer.writerow(export_field_names)
        for obj in queryset:
            attributes = []
            for field in export_field_attributes:
                try:
                    attributes.append(rgetattr(obj, field))
                except ObjectDoesNotExist:
                    attributes.append(None)

            writer.writerow(attributes)

        return response

    export_as_csv.short_description = "Export Selected"


@admin.register(TeamApplied)
class TeamAppliedAdmin(admin.ModelAdmin):
    search_fields = ("id", "team_code")
    list_display = ("team_code", "get_members_count")
    inlines = (ApplicationInline,)

    def get_members_count(self, obj):
        return obj.applications.count()

    get_members_count.short_description = "Members"

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("applications")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin, ExportCsvMixin):
    autocomplete_fields = ("user", "team")
    list_display = ("get_full_name", "team", "school")
    search_fields = (
        "user__email",
        "user__first_name",
        "user__last_name",
        "team__team_code",
    )
    list_filter = ("school",)
    actions = ["export_as_csv"]

    export_fields = [
        ("First Name", "user.first_name"),
        ("Last Name", "user.last_name"),
        ("Email", "user"),
        ("Team Code", "team"),
        ("Birthday", "birthday"),
        ("Gender", "gender"),
        ("Ethnicity", "ethnicity"),
        ("School", "school"),
        ("Study Level", "study_level"),
        ("Graduation Year", "graduation_year"),
        ("Review Status", "review.status"),
        ("RSVP", "rsvp"),
        ("Created At", "created_at"),
        ("Updated At", "updated_at"),
    ]

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    get_full_name.short_description = "User"
