from hardware.models import Hardware, Category, Order
from rest_framework import generics, mixins
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    HardwareOrderSerializer,
)


class HardwareListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class CategoryListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class HardwareOrderListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Order.objects.all()
    serializer_class = HardwareOrderSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
