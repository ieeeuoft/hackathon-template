from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter
from django_filters import rest_framework as filters
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderSerializer,
)

from hardware.api_filters import HardwareFilter
from hardware.models import Hardware, Category, Order


class HardwareListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_fields = ("name", "quantity_remaining")
    filterset_class = HardwareFilter
    search_fields = "name"

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class HardwareDetailView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class CategoryListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class OrderListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
