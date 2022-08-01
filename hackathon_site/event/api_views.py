from django.db import transaction
from django.db.models import Q
from django.conf import settings

from rest_framework import generics, mixins, status
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response


from event.serializers import (
    ProfileSerializer,
    CurrentProfileSerializer,
    UserReviewStatusSerializer,
)
from event.models import User, Team as EventTeam, Profile
from event.serializers import UserSerializer, TeamSerializer
from hardware.serializers import IncidentCreateSerializer, OrderListSerializer
from event.permissions import UserHasProfile, FullDjangoModelPermissions

from hardware.models import OrderItem, Order, Incident
from hardware.serializers import OrderListSerializer, TeamOrderChangeSerializer


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

        # Raise 400 if team has active orders
        active_orders = OrderItem.objects.filter(
            ~Q(order__status="Cancelled"), Q(order__team=team),
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
            ~Q(order__status="Cancelled"), Q(order__team=current_team),
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


class CurrentProfileView(mixins.UpdateModelMixin, generics.GenericAPIView):

    queryset = Profile.objects.all()
    serializer_class = CurrentProfileSerializer
    permission_classes = [UserHasProfile]

    def get_object(self):
        return self.request.user.profile

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class CurrentTeamOrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [UserHasProfile]

    def get_queryset(self):
        return Order.objects.filter(team_id=self.request.user.profile.team_id)

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)


class TeamDetailView(mixins.RetrieveModelMixin, generics.GenericAPIView):
    queryset = EventTeam.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [FullDjangoModelPermissions]

    def get(self, request, *args, **kwargs):
        return self.retrieve(request, *args, **kwargs)


class TeamOrderDetailView(mixins.UpdateModelMixin, generics.GenericAPIView):
    queryset = Order.objects.all()
    serializer_class = TeamOrderChangeSerializer
    permission_classes = [UserHasProfile]

    def check_object_permissions(self, request, obj: Order):
        order_team = obj.team
        user_team = request.user.profile.team

        if order_team != user_team:
            raise PermissionDenied("Can only change the status of your orders.")

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
