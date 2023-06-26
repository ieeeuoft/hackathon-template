import logging

from django.core import mail
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from django.conf import settings
from django.http import HttpResponseServerError
from django.template.loader import render_to_string
from drf_yasg.utils import swagger_auto_schema

from rest_framework import generics, mixins, status, permissions
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response


from event.serializers import (
    ProfileSerializer,
    CurrentProfileSerializer,
    ProfileCreateResponseSerializer,
    UserReviewStatusSerializer,
)
from event.models import User, Team as EventTeam, Profile
from event.serializers import UserSerializer, TeamSerializer
from hardware.serializers import (
    IncidentCreateSerializer,
    OrderListSerializer,
    TeamOrderChangeSerializer,
)
from event.permissions import UserHasProfile, FullDjangoModelPermissions
from hardware.models import OrderItem, Order, Incident

logger = logging.getLogger(__name__)

ORDER_STATUS_MSG = {"Cancelled": "was Cancelled"}

ORDER_STATUS_CLOSING_MSG = {
    "Cancelled": "Feel free to continue ordering hardware, and Happy Hacking!"
}


class CurrentUserAPIView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    """
    View to handle API interaction with the current user's Profile
    """

    queryset = User.objects.select_related("profile")
    serializer_class = UserSerializer

    def get_object(self):
        queryset = self.get_queryset()

        return generics.get_object_or_404(queryset, id=self.request.user.id)

    def get(self, request, *args, **kwargs):
        """
        Get the current user's profile and user details

        Reads the profile of the current logged in user. User details and
        group list are nested within the profile and user object, respectively.
        """
        return self.retrieve(request, *args, **kwargs)


class UserReviewStatusAPIView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    """
    View to handle review status of a user with a certain username
    """

    queryset = User.objects.all()
    permissions_classes = [FullDjangoModelPermissions]
    serializer_class = UserReviewStatusSerializer
    lookup_field = "email"

    def get(self, request, *args, **kwargs):
        """
        Get the current user's review status and user details
        Reads the review status status of the specified email/username
        """
        return self.retrieve(request, *args, **kwargs)


class CurrentUserReviewStatusAPIView(
    generics.GenericAPIView, mixins.RetrieveModelMixin
):
    """
    View to handle review status status of user
    """

    queryset = User.objects.select_related("application")
    serializer_class = UserReviewStatusSerializer

    def get_object(self):
        queryset = self.get_queryset()
        return generics.get_object_or_404(queryset, id=self.request.user.id)

    def get(self, request, *args, **kwargs):
        """
        Get the current user's review status and user details
        Reads the review status status of the current logged in user.
        """
        return self.retrieve(request, *args, **kwargs)


class CurrentTeamAPIView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    """
    View to handle API interaction with the current logged in user's EventTeam
    """

    queryset = EventTeam.objects.all()
    serializer_class = TeamSerializer

    def get_object(self):
        queryset = self.get_queryset()

        return generics.get_object_or_404(
            queryset, profiles__user_id=self.request.user.id
        )

    def get(self, request, *args, **kwargs):
        """
        Get the current users team profile and team details
        Reads the profile of the current logged in team.
        """
        return self.retrieve(request, *args, **kwargs)


class LeaveTeamView(generics.GenericAPIView):
    serializer_class = TeamSerializer
    permission_classes = [UserHasProfile]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        profile = request.user.profile
        team = profile.team

        if Profile.objects.filter(team__exact=team).count() <= 1:
            raise ValidationError(
                {"detail": "Cannot leave a team with only 1 member"},
                code=status.HTTP_400_BAD_REQUEST,
            )

        # Raise 400 if team has active orders
        active_orders = OrderItem.objects.filter(
            ~Q(order__status="Cancelled"),
            ~Q(order__status="Returned"),
            Q(order__team=team),
        )
        if active_orders.exists():
            raise ValidationError(
                {"detail": "Cannot leave a team with already processed orders"},
                code=status.HTTP_400_BAD_REQUEST,
            )

        # create new team
        profile.team = EventTeam.objects.create()
        profile.save()

        # delete old team if empty
        if not team.profiles.exists():
            team.delete()

        # Construct response data
        response_serializer = TeamSerializer(profile.team)
        response_data = response_serializer.data
        return Response(data=response_data, status=status.HTTP_201_CREATED,)


class JoinTeamView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    permission_classes = [UserHasProfile]
    serializer_class = TeamSerializer
    lookup_field = "team_code"
    queryset = EventTeam.objects.all()

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        profile = request.user.profile
        current_team = profile.team

        team = self.get_object()

        if team.profiles.count() >= settings.MAX_MEMBERS:
            raise ValidationError({"detail": "Team is full"})

        active_orders = OrderItem.objects.filter(
            ~Q(order__status="Cancelled"),
            ~Q(order__status="Returned"),
            Q(order__team=current_team),
        )
        if active_orders.exists():
            raise ValidationError(
                {"detail": "Cannot leave a team with already processed orders"},
                code=status.HTTP_400_BAD_REQUEST,
            )

        profile.team = team
        profile.save()
        if not current_team.profiles.exists():
            current_team.delete()
        response_serializer = TeamSerializer(profile.team)
        response_data = response_serializer.data
        return Response(data=response_data, status=status.HTTP_200_OK,)


class TeamIncidentListView(
    mixins.ListModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):
    queryset = Incident.objects.all()

    serializer_class = IncidentCreateSerializer
    permission_classes = [UserHasProfile]

    def perform_create(self, serializer):
        incident_team = serializer.validated_data["order_item"].order.team
        user_team = self.request.user.profile.team

        if incident_team != user_team:
            raise PermissionDenied("Can only create incidents for your own team.")
        serializer.save()

    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)


class ProfileDetailView(mixins.UpdateModelMixin, generics.GenericAPIView):

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [FullDjangoModelPermissions]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class CurrentProfileView(
    mixins.UpdateModelMixin, mixins.CreateModelMixin, generics.GenericAPIView
):

    queryset = Profile.objects.all()

    serializer_class = CurrentProfileSerializer

    def get_object(self):
        return self.request.user.profile

    def get_permissions(self):
        if self.request.method == "PATCH" or self.request.method == "GET":
            return [UserHasProfile()]
        elif self.request.method == "POST":
            return [permissions.IsAuthenticated()]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

    @swagger_auto_schema(responses={201: ProfileCreateResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        create_response = serializer.save()
        response_serializer = ProfileCreateResponseSerializer(data=create_response)
        if not response_serializer.is_valid():
            return HttpResponseServerError()
        response_data = response_serializer.data
        return Response(response_data, status=status.HTTP_201_CREATED)


class CurrentTeamOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [UserHasProfile]

    def get_queryset(self):
        return Order.objects.filter(team_id=self.request.user.profile.team_id)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class TeamDetailView(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    generics.GenericAPIView,
):
    serializer_class = TeamSerializer
    permission_classes = [FullDjangoModelPermissions]
    lookup_field = "team_code"
    queryset = EventTeam.objects.all()

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        team = self.get_object()
        active_orders = Order.objects.filter(
            Q(team=team), ~Q(status="Cancelled"), ~Q(status="Returned"),
        )
        if active_orders.exists():
            raise ValidationError(
                {"detail": "Cannot delete a team with unreturned order items"},
                code=status.HTTP_400_BAD_REQUEST,
            )

        return self.destroy(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        try:
            data = request.data
            if not isinstance(data, dict):
                raise ValueError("Invalid request data format")
            valid_fields = {"project_description"}
            for field in data:
                if field not in valid_fields:
                    raise ValueError(f'"{field}" is not a valid field for update')
                if field == "project_description" and not isinstance(data[field], str):
                    raise ValueError("project_description must be a string")
            return self.partial_update(request, *args, **kwargs)
        except ValueError as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)


class TeamOrderDetailView(mixins.UpdateModelMixin, generics.GenericAPIView):
    queryset = Order.objects.all()
    serializer_class = TeamOrderChangeSerializer
    permission_classes = [UserHasProfile]

    update_order_email_subject_template = (
        "hardware/emails/order_status_change/order_status_change_email_subject.txt"
    )
    update_order_email_template_participant = (
        "hardware/emails/order_status_change/order_status_change_email_body.html"
    )
    update_order_email_template_admin = (
        "hardware/emails/order_status_change/order_status_change_email_admin_body.html"
    )

    def check_object_permissions(self, request, obj: Order):
        order_team = obj.team
        user_team = request.user.profile.team

        if order_team != user_team:
            raise PermissionDenied("Can only change the status of your orders.")

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
                    "order_status_message": f'{ORDER_STATUS_MSG[response.data["status"]]} by {request.user.first_name}',
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
