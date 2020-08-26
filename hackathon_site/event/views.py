from django.views.generic import TemplateView
from rest_framework import generics, mixins

from event.models import User
from event.serializers import UserSerializer


class IndexView(TemplateView):
    template_name = "event/landing.html"


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
