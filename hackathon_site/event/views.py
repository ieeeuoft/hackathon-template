from django.views.generic import TemplateView
from rest_framework import generics, mixins

from event.models import User, Team
from event.serializers import UserSerializer, TeamSerializer


class IndexView(TemplateView):
    template_name = "event/base.html"


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


class CurrentTeamAPIView(generics.GenericAPIView, mixins.RetrieveModelMixin):
    """
    View to handle API interaction with the current logged in user's team
    """

    queryset = Team.objects.all()
    serializer_class = TeamSerializer

    def get_object(self):
        queryset = self.get_queryset()

        return generics.get_object_or_404(
            queryset, profile__user_id=self.request.user.id
        )

    def get(self, request, *args, **kwargs):
        """
        Get the current users team profile and team details

        Reads the profile of the current logged in team.
        """
        return self.retrieve(request, *args, **kwargs)
