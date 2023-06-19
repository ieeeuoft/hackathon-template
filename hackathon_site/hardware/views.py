import logging

from django.conf import settings
from django.core import mail
from django.core.mail import send_mail
from django_filters import rest_framework as filters
from django.db import transaction
from django.http import HttpResponseServerError
from drf_yasg.utils import swagger_auto_schema
from django.template.loader import render_to_string

from rest_framework import generics, mixins, status, permissions
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter

from event.models import Profile
from event.permissions import UserHasProfile, FullDjangoModelPermissions, UserIsAdmin
from hardware.api_filters import (
    HardwareFilter,
    OrderFilter,
    IncidentFilter,
    OrderItemFilter,
)
from hardware.models import Hardware, Category, Order, Incident, OrderItem

from hardware.serializers import (
    CategorySerializer,
    HardwareSerializer,
    IncidentSerializer,
    IncidentPatchSerializer,
    IncidentCreateSerializer,
    OrderListSerializer,
    OrderCreateSerializer,
    OrderCreateResponseSerializer,
    OrderChangeSerializer,
    OrderItemListSerializer,
    OrderItemReturnSerializer,
    OrderItemReturnResponseSerializer,
)

logger = logging.getLogger(__name__)

ORDER_STATUS_MSG = {
    "Ready for Pickup": "is Ready for Pickup!",
    "Picked Up": "has been Picked Up!",
    "Cancelled": f"was Cancelled by a {settings.HACKATHON_NAME} Exec.",
    "Returned": f"has been returned.",
}

ORDER_STATUS_CLOSING_MSG = {
    "Ready for Pickup": "Please go to the Tech Team Station to retrieve your order.",
    "Picked Up": "Take good care of your hardware and Happy Hacking! Remember to return the items when you are finished using them.",
    "Cancelled": f"A {settings.HACKATHON_NAME} exec will be in contact with you shortly. If you don't hear back from them soon, please go to the Tech Team Station for more information on why your order was cancelled.",
    "Returned": f"Thank you for returning all hardware items!",
}


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
    search_fields = (
        "state",
        "order_item__order__team__team_code",
        "order_item__hardware__name",
        "order_item__hardware__manufacturer",
    )

    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_class = IncidentFilter
    permission_classes = [FullDjangoModelPermissions]
    queryset = Incident.objects.all().select_related("order_item__order__team")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return IncidentSerializer
        elif self.request.method == "POST":
            return IncidentCreateSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class IncidentDetailView(
    mixins.RetrieveModelMixin, mixins.UpdateModelMixin, generics.GenericAPIView
):
    queryset = Incident.objects.all()

    permission_classes = [FullDjangoModelPermissions]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return IncidentSerializer
        elif self.request.method == "PATCH":
            return IncidentPatchSerializer

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        try:
            data = request.data
            if not isinstance(data, dict):
                raise ValueError("Invalid request data format")
            valid_fields = {"state", "time_occurred", "description"}
            for field in data:
                if field not in valid_fields:
                    raise ValueError(f'"{field}" is not a valid field')
            return self.partial_update(request, *args, **kwargs)
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)


class OrderItemListView(mixins.ListModelMixin, generics.GenericAPIView):
    search_fields = ("order__team__team_code", "order__id")
    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_class = OrderItemFilter
    permission_classes = [FullDjangoModelPermissions]
    queryset = OrderItem.objects.all().select_related("order__team")
    serializer_class = OrderItemListSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class CategoryListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = Category.objects.all().prefetch_related("hardware_set")
    serializer_class = CategorySerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class OrderListView(generics.ListAPIView):
    queryset = Order.objects.all().select_related("team").prefetch_related("items",)
    serializer_method_classes = {
        "GET": OrderListSerializer,
        "POST": OrderCreateSerializer,
    }

    filter_backends = (filters.DjangoFilterBackend, OrderingFilter, SearchFilter)
    filterset_class = OrderFilter
    ordering_fields = ("created_at",)
    search_fields = ("team__team_code", "id")

    create_order_email_subject_template = (
        "hardware/emails/create_order/create_order_email_subject.txt"
    )
    create_order_email_body_template_participant = (
        "hardware/emails/create_order/create_order_email_body.html"
    )
    create_order_email_body_template_admin = (
        "hardware/emails/create_order/create_order_email_admin_body.html"
    )

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

        profiles = Profile.objects.filter(team__exact=request.user.profile.team)
        connection = mail.get_connection(fail_silently=False)
        connection.open()

        try:
            render_to_string_context = {
                "requester": request.user,
                "recipient": "Hardware Inventory Admins",
                "order": response_data,
            }
            send_mail(
                subject=render_to_string(
                    self.create_order_email_subject_template, render_to_string_context
                ),
                message=render_to_string(
                    self.create_order_email_body_template_admin,
                    render_to_string_context,
                ),
                html_message=render_to_string(
                    self.create_order_email_body_template_admin,
                    render_to_string_context,
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                connection=connection,
                recipient_list=[settings.HSS_ADMIN_EMAIL],
            )
            for profile in profiles:
                render_to_string_context = {
                    **render_to_string_context,
                    "recipient": profile.user,
                }
                profile.user.email_user(
                    subject=render_to_string(
                        self.create_order_email_subject_template,
                        render_to_string_context,
                    ),
                    message=render_to_string(
                        self.create_order_email_body_template_participant,
                        render_to_string_context,
                    ),
                    html_message=render_to_string(
                        self.create_order_email_body_template_participant,
                        render_to_string_context,
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    connection=connection,
                )
        except Exception as e:
            logger.error(e)
            raise e
        finally:
            connection.close()
        return Response(response_data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.GenericAPIView, mixins.UpdateModelMixin):
    queryset = Order.objects.all()
    serializer_class = OrderChangeSerializer
    permission_classes = [FullDjangoModelPermissions]

    update_order_email_subject_template = (
        "hardware/emails/order_status_change/order_status_change_email_subject.txt"
    )
    update_order_email_template_participant = (
        "hardware/emails/order_status_change/order_status_change_email_body.html"
    )
    update_order_email_template_admin = (
        "hardware/emails/order_status_change/order_status_change_email_admin_body.html"
    )

    def patch(self, request, *args, **kwargs):
        response = self.partial_update(request, *args, **kwargs)

        if "status" in request.data:
            profiles = Profile.objects.filter(team__exact=response.data["team_id"])
            connection = mail.get_connection(fail_silently=False)
            connection.open()

            try:
                render_to_string_context = {
                    "recipient": "Hardware Inventory Admins",
                    "order": response.data,
                    "order_status_message": ORDER_STATUS_MSG[response.data["status"]],
                }
                send_mail(
                    subject=render_to_string(
                        self.update_order_email_subject_template,
                        render_to_string_context,
                    ),
                    message=render_to_string(
                        self.update_order_email_template_admin,
                        render_to_string_context,
                    ),
                    html_message=render_to_string(
                        self.update_order_email_template_admin,
                        render_to_string_context,
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    connection=connection,
                    recipient_list=[settings.HSS_ADMIN_EMAIL],
                )
                for profile in profiles:
                    render_to_string_context = {
                        **render_to_string_context,
                        "recipient": profile.user,
                        "order_status_closing_message": ORDER_STATUS_CLOSING_MSG[
                            response.data["status"]
                        ],
                    }
                    profile.user.email_user(
                        subject=render_to_string(
                            self.update_order_email_subject_template,
                            render_to_string_context,
                        ),
                        message=render_to_string(
                            self.update_order_email_template_participant,
                            render_to_string_context,
                        ),
                        html_message=render_to_string(
                            self.update_order_email_template_participant,
                            render_to_string_context,
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        connection=connection,
                    )
            except Exception as e:
                logger.error(e)
                raise e
            finally:
                connection.close()
        return response


class OrderItemReturnView(generics.GenericAPIView):
    queryset = Order.objects.all().prefetch_related("items",)
    serializer_class = OrderItemReturnSerializer
    permission_classes = [UserIsAdmin]

    return_order_email_subject_template = (
        "hardware/emails/return_order/return_order_email_subject.txt"
    )
    return_order_email_body_template_participant = (
        "hardware/emails/return_order/return_order_email_body.html"
    )
    return_order_email_body_template_admin = (
        "hardware/emails/return_order/return_order_email_admin_body.html"
    )

    @transaction.atomic
    @swagger_auto_schema(responses={201: OrderItemReturnResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_response = serializer.save()
        response_serializer = OrderItemReturnResponseSerializer(data=create_response)
        if not response_serializer.is_valid():
            logger.error(response_serializer.errors)
            return HttpResponseServerError()

        if len(create_response["returned_items"]) > 0:
            profiles = Profile.objects.filter(
                team__team_code=create_response["team_code"]
            )
            connection = mail.get_connection(fail_silently=False)
            connection.open()

            try:
                render_to_string_context = {
                    "requester": request.user,
                    "recipient": "Hardware Inventory Admins",
                    "order": create_response,
                }
                send_mail(
                    subject=render_to_string(
                        self.return_order_email_subject_template,
                        render_to_string_context,
                    ),
                    message=render_to_string(
                        self.return_order_email_body_template_admin,
                        render_to_string_context,
                    ),
                    html_message=render_to_string(
                        self.return_order_email_body_template_admin,
                        render_to_string_context,
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    connection=connection,
                    recipient_list=[settings.HSS_ADMIN_EMAIL],
                )
                for profile in profiles:
                    render_to_string_context = {
                        **render_to_string_context,
                        "recipient": profile.user,
                    }
                    profile.user.email_user(
                        subject=render_to_string(
                            self.return_order_email_subject_template,
                            render_to_string_context,
                        ),
                        message=render_to_string(
                            self.return_order_email_body_template_participant,
                            render_to_string_context,
                        ),
                        html_message=render_to_string(
                            self.return_order_email_body_template_participant,
                            render_to_string_context,
                        ),
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        connection=connection,
                    )
            except Exception as e:
                logger.error(e)
                raise e
            finally:
                connection.close()
        return Response(create_response, status=status.HTTP_201_CREATED)
