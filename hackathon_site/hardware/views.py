import logging

from django_filters import rest_framework as filters
from django.db import transaction
from django.http import HttpResponseServerError
from drf_yasg.utils import swagger_auto_schema

from rest_framework import generics, mixins, status, permissions
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.filters import SearchFilter, OrderingFilter

from event.permissions import UserHasProfile, FullDjangoModelPermissions
from hardware.api_filters import HardwareFilter, OrderFilter, IncidentFilter
from hardware.models import Hardware, Category, Order, Incident

from hardware.serializers import (
    CategorySerializer,
    HardwareSerializer,
    IncidentSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderCreateResponseSerializer,
    OrderChangeSerializer,
)

logger = logging.getLogger(__name__)


class HardwareListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_class = HardwareFilter
    search_fields = ("name",)
    ordering_fields = ("name", "quantity_remaining")

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class HardwareDetailView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    queryset = Hardware.objects.all()
    serializer_class = HardwareSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class IncidentListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Incident.objects.all().select_related(
        "order_item", "order_item__order__team", "order_item__hardware"
    )
    serializer_class = IncidentSerializer

    search_fields = (
        "state",
        "order_item__order__team__team_code",
        "order_item__hardware__name",
        "order_item__hardware__manufacturer",
    )

    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_class = IncidentFilter

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class CategoryListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all().prefetch_related("hardware_set")
    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class OrderListView(generics.ListAPIView):
    queryset = (
        Order.objects.all().select_related("team")
        # TODO: Causing problems with queryset aggregations, will figure out later:
        # .prefetch_related("hardware", "hardware__categories")
    )
    serializer_method_classes = {
        "GET": OrderListSerializer,
        "POST": OrderCreateSerializer,
    }

    filter_backends = (filters.DjangoFilterBackend, OrderingFilter, SearchFilter)
    filterset_class = OrderFilter
    ordering_fields = ("created_at",)
    search_fields = ("team__team_code", "id")

    def get_serializer_class(self):
        try:
            return self.serializer_method_classes[self.request.method]
        except (KeyError, AttributeError):
            return super().get_serializer_class()

    def get_permissions(self):
        if self.request.method == "POST":
            return [UserHasProfile()]
        elif self.request.method == "GET":
            return [FullDjangoModelPermissions()]
        return [permissions.IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    @transaction.atomic
    @swagger_auto_schema(responses={201: OrderCreateResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_response = serializer.save()
        response_serializer = OrderCreateResponseSerializer(data=create_response)
        if not response_serializer.is_valid():
            logger.error(response_serializer.error_messages)
            return HttpResponseServerError()
        response_data = response_serializer.data
        return Response(response_data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.GenericAPIView, mixins.UpdateModelMixin):
    queryset = Order.objects.all()
    serializer_class = OrderChangeSerializer
    permission_classes = [FullDjangoModelPermissions]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        change_options = {
            "Submitted": ["Cancelled", "Ready for Pickup"],
            "Ready for Pickup": ["Picked Up"]
        }
        current_status = order.status
        if current_status not in change_options:
            raise ValidationError(
                {"detail": "Cannot change the status for this order."},
                code=status.HTTP_400_BAD_REQUEST,
            )
        allowed_statuses = change_options[current_status]
        if request.data['status'] not in allowed_statuses:
            raise ValidationError(
                {"detail": "Cannot change the current status of the order to the desired order."},
                code=status.HTTP_400_BAD_REQUEST,
            )
        return self.partial_update(request, *args, **kwargs)
