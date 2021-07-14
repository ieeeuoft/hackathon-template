from django_filters import rest_framework as filters

from hardware.models import Hardware
from hardware.serializers import HardwareSerializer


class HardwareFilter(filters.FilterSet):
    queryset = Hardware
    serializer_class = HardwareSerializer

    class Meta:
        model = Hardware
        fields = ["name", "quantity_available"]

    in_stock = filters.BooleanFilter(label="In stock?", method="filter_in_stock")

    @staticmethod
    def filter_in_stock(queryset, _, value):
        if value is True:
            return queryset.filter(quantity_available__gt=0)
        else:
            return queryset.filter(quantity_available__lte=0)

    id = filters.BaseInFilter(field_name="id", label="Comma separated list of hardware IDs")
