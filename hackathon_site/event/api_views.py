from rest_framework import generics, mixins

from event.models import User
from event.serializers import UserSerializer
from event.permissions import UserHasProfile

from hardware.models import OrderItem


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


class JoinTeamView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    permission_classes = [UserHasProfile]

    def clean(self):
        if not is_registration_open():
            raise forms.ValidationError(
                _("You cannot change teams after registration has closed."),
                code="registration_closed",
            )

        return super().clean()

    @transaction.atomic
    @swagger_auto_schema(responses={201: TeamSerializer})
    def post(self, request, team_code, *args, **kwargs):

        profile = request.user.profile
        current_team_code = team_code
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

        if not team.profiles.exists():
            raise ValidationError(
                {"detail": "Cannot join a non-existent team!"},
                code=status.HTTP_400_BAD_REQUEST,
            )
        if team.applications.count() >= Team.MAX_MEMBERS:
            raise ValidationError(
                {"detail":"Team is full"}
            )

        profile.team = current_team_code
        profile.save()

        response_serializer = TeamSerializer(profile.team)
        response_data = response_serializer.data
        return Response(data=response_data, status=status.HTTP_201_CREATED,)
