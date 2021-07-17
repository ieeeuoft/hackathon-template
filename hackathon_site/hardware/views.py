from django.db import transaction
from django.contrib.auth.mixins import UserPassesTestMixin
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseServerError
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
import logging

logger = logging.getLogger(__name__)


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


class OrderListView(UserPassesTestMixin, generics.ListAPIView):
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

    def get_test_func(self):
        if self.request.method == "POST":
            return self.check_user_has_profile
        if self.request.method == "GET":
            return lambda: True

    def check_user_has_profile(self):
        has_profile = False
        try:
            profile = self.request.user.profile
            has_profile = True
        except ObjectDoesNotExist:
            pass
        return has_profile

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
        response_data = response_serializer.validated_data
        return Response(response_data, status=status.HTTP_201_CREATED)
