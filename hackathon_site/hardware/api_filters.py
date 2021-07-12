from django_filters import rest_framework as filters
from django_filters.fields import Lookup

from hardware.models import Hardware
from hardware.serializers import HardwareSerializer


class HardwareFilter(filters.FilterSet):
    queryset = Hardware
    serializer_class = HardwareSerializer

    class Meta:
        model = Hardware
        fields = ["name", "quantity_available"]

    def comma_separated_filter(self, queryset, value):
        value_list = value.split(",")
        queryset = super().filter(queryset, Lookup(value_list, "in"))

        return queryset

    in_stock = filters.BooleanFilter(label="In stock?", method="filter_in_stock")

    @staticmethod
    def filter_in_stock(queryset, _, value):
        if value is True:
            return queryset.filter(quantity_available__gt=0)
        else:
            return queryset.filter(quantity_available__lte=0)

    id = filters.BaseInFilter(field_name="id", label="Id(s) of the hardware item")
