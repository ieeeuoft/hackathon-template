from hardware.models import Hardware, Category, Order
from rest_framework import generics, mixins, viewsets
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderListSerializer,
)


class HardwareListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

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


class OrderViewSet(
    mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet
):
    queryset = Order.objects.all()
    serializer_class = OrderListSerializer
    serializer_action_classes = {"list": OrderListSerializer}

    def get_serializer_class(self):
        try:
            return self.serializer_action_classes[self.action]
        except (KeyError, AttributeError):
            return super(OrderViewSet, self).get_serializer_class()

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
