import logging

from django_filters import rest_framework as filters
from django.db import transaction
from django.http import HttpResponseServerError
from drf_yasg.utils import swagger_auto_schema

from rest_framework import generics, mixins, status, permissions
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from event.permissions import UserHasProfile, FullDjangoModelPermissions
from hardware.api_filters import HardwareFilter, OrderFilter, IncidentFilter
from hardware.models import Hardware, Category, Order, Incident

from hardware.serializers import (
    CategorySerializer,
    HardwareSerializer,
    IncidentListSerializer,
    IncidentCreateSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderCreateResponseSerializer,
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


class IncidentListView(
    mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):
    queryset = Incident.objects.all().select_related(
        "order_item", "order_item__order__team", "order_item__hardware"
    )
    serializer_class = IncidentListSerializer

    search_fields = (
        "state",
        "order_item__order__team__team_code",
        "order_item__hardware__name",
        "order_item__hardware__manufacturer",
    )

    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_class = IncidentFilter

    def get_serializer_class(self):
        if self.request.method == "GET":
            return IncidentListSerializer
        elif self.request.method == "POST":
            return IncidentCreateSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [FullDjangoModelPermissions()]
        return [permissions.IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


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
    serializer_class = OrderListSerializer
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
        if self.request.method == "GET":
            return [FullDjangoModelPermissions()]
        return [permissions.IsAuthenticated()]

    # TODO: make this admin only
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
