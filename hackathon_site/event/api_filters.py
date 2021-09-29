from django import forms
from django_filters import rest_framework as filters, widgets


from event.models import Team as EventTeam
from event.serializers import TeamSerializer


class CSVInputIntegerField(forms.IntegerField):
    widget = widgets.CSVWidget


class IntegerCSVFilter(filters.BaseInFilter):
    field_class = CSVInputIntegerField


class TeamFilter(filters.FilterSet):
    queryset = EventTeam
    serializer_class = TeamSerializer

    team_ids = IntegerCSVFilter(
        field_name="id",
        label="Comma separated list of team IDs",
        help_text="Comma separated list of team IDs",
    )

    team_code = filters.CharFilter(
        field_name="team_code", label="Team code", help_text="Team code",
    )
