from django_filters import rest_framework as filters

from hardware.models import Hardware
from hardware.serializers import HardwareSerializer


class NumberInFilter(filters.BaseInFilter, filters.NumberFilter):
    pass

class HardwareFilter(filters.FilterSet):
    queryset = Hardware
    serializer_class = HardwareSerializer



    in_stock = filters.BooleanFilter(label="In stock?", method="filter_in_stock", help_text="In stock?")

    @staticmethod
    def filter_in_stock(queryset, _, value):
        if value is True:
            return queryset.filter(quantity_available__gt=0)
        else:
            return queryset.filter(quantity_available__lte=0)

    id = NumberInFilter(field_name="id", label="Comma separated list of hardware IDs", help_text="Comma separated list of hardware IDs")
