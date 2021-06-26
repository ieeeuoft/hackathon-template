from django_filters import rest_framework as filters
from models import Hardware
from serializers import HardwareSerializer
from django_filters.fields import Lookup


class HardwareFilter(filters.FilterSet):
    queryset = Hardware
    serializer_class = HardwareSerializer

    class Meta:
        model = Hardware
        fields = ["name", "quantity_remaining"]

    def comma_separate_filter(self, queryset, value):
        value_list = value.split(",")
        queryset = super().filter(queryset, Lookup(value_list, "in"))

        return queryset

    in_stock = filters.BooleanFilter(
        field_name="quantity_remaining", lookup_expr="gt", exclude=False
    )
    category_ID = filters.CharFilter(method="comma_separate_filter")
