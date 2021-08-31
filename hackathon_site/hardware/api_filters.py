from django import forms
from django_filters import rest_framework as filters, widgets

from hardware.models import Hardware
from hardware.serializers import HardwareSerializer


class CSVInputIntegerField(forms.IntegerField):
    widget = widgets.CSVWidget


class IntegerCSVFilter(filters.BaseInFilter):
    field_class = CSVInputIntegerField


class HardwareFilter(filters.FilterSet):
    queryset = Hardware
    serializer_class = HardwareSerializer

    in_stock = filters.BooleanFilter(
        label="In stock?", method="filter_in_stock", help_text="In stock?"
    )

    @staticmethod
    def filter_in_stock(queryset, _, value):
        if value is True:
            return queryset.filter(quantity_remaining__gt=0)
        else:
            return queryset.filter(quantity_remaining__lte=0)

    hardware_ids = IntegerCSVFilter(
        field_name="id",
        label="Comma separated list of hardware IDs",
        help_text="Comma separated list of hardware IDs",
    )

    category_ids = IntegerCSVFilter(
        field_name="categories",
        label="Comma separated list of category IDs",
        help_text="Comma separated list of category IDs",
    )
