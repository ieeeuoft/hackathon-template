from django.db import transaction
from rest_framework import generics, mixins, status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from hardware.models import Hardware, Category, Order
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderCreateResponseSerializer,
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


class OrderListView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderListSerializer
    serializer_method_classes = {
        "GET": OrderListSerializer,
        "POST": OrderCreateSerializer,
    }

    def get_serializer_class(self):
        try:
            return self.serializer_method_classes[self.request.method]
        except (KeyError, AttributeError):
            return super().get_serializer_class()

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @transaction.atomic
    @swagger_auto_schema(responses={201: OrderCreateResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_order, unfulfilled_hardware_requests = serializer.save()
        if new_order is None:
            return Response(
                {"details": "Cannot be fulfilled"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        response_serializer = OrderCreateResponseSerializer(
            new_order, context={"unfulfilled": unfulfilled_hardware_requests}
        )
        response_data = response_serializer.data
        headers = self.get_success_headers(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
