from django.db import transaction
from django.db.models import Q

from rest_framework import generics, mixins, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response


from event.models import User, Team as EventTeam
from event.serializers import UserSerializer, TeamSerializer
from event.permissions import UserHasProfile, FullDjangoModelPermissions

from hardware.models import OrderItem, Order
from hardware.serializers import OrderListSerializer, OrderChangeSerializer


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

        if team.profiles.count() >= EventTeam.MAX_MEMBERS:
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
    serializer_class = OrderChangeSerializer
    permission_classes = [UserHasProfile]

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        change_options = {
            "Submitted": ["Cancelled"],
        }
        current_status = order.status
        order_team, user_team = (
            order.team.team_code,
            request.user.profile.team.team_code,
        )

        if order_team != user_team:
            raise ValidationError(
                {"detail": "Cannot change the status for another team's order."},
                code=status.HTTP_403_FORBIDDEN,
            )
        if current_status not in change_options:
            raise ValidationError(
                {"detail": "Cannot change the status for this order."},
                code=status.HTTP_400_BAD_REQUEST,
            )
        allowed_statuses = change_options[current_status]
        if request.data["status"] not in allowed_statuses:
            raise ValidationError(
                {
                    "detail": "Cannot change the current status of the order to the desired order."
                },
                code=status.HTTP_400_BAD_REQUEST,
            )
        return self.partial_update(request, *args, **kwargs)
