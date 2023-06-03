from django import forms
from django_filters import rest_framework as filters, widgets

from hardware.models import Hardware, Order, Incident, OrderItem
from hardware.serializers import (
    HardwareSerializer,
    OrderListSerializer,
    IncidentSerializer,
    OrderItemListSerializer,
)


class CSVInputIntegerField(forms.IntegerField):
    widget = widgets.CSVWidget


class IntegerCSVFilter(filters.BaseInFilter):
    field_class = CSVInputIntegerField


class IncidentFilter(filters.FilterSet):
    queryset = Incident
    serializer_class = IncidentSerializer

    hardware_id = filters.NumberFilter(field_name="order_item__hardware__id")
    team_id = filters.NumberFilter(field_name="order_item__order__team__id")


class OrderItemFilter(filters.FilterSet):
    queryset = OrderItem
    serializer_class = OrderItemListSerializer

    order_id = IntegerCSVFilter(
        field_name="order__id",
        label="Comma separated list of order IDs",
        help_text="Comma separated list of order IDs",
    )
    team_code = filters.CharFilter(field_name="order__team__team_code")


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


class OrderFilter(filters.FilterSet):
    queryset = Order
    serializer_class = OrderListSerializer

    team_id = IntegerCSVFilter(
        field_name="team__id",
        label="Comma separated list of team IDs",
        help_text="Comma separated list of team IDs",
    )
    team_code = filters.CharFilter(field_name="team__team_code")
    status = filters.BaseInFilter(
        field_name="status",
        label="Comma separated list of statuses",
        help_text="Comma separated list of statuses",
    )
