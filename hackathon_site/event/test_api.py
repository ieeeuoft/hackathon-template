from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from hackathon_site.tests import SetupUserMixin

from event.models import Profile, User, Team
from event.serializers import (
    TeamSerializer,
    UserSerializer,
)


class CurrentUserTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.group = Group.objects.create(name="Test Users")
        self.user.groups.add(self.group)
        self.profile = Profile.objects.create(user=self.user)

        self.view = reverse("api:event:current-user")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        expected_response = {
            **{
                attr: getattr(self.user, attr)
                for attr in ("id", "first_name", "last_name", "email")
            },
            "profile": None,
            "groups": [{"id": self.group.id, "name": self.group.name}],
        }
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(expected_response, data)

    def test_user_has_profile(self):
        self._login()
        response = self.client.get(self.view)

        user_expected = User.objects.get(pk=self.user.pk)
        serializer = UserSerializer(user_expected)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), serializer.data)


class CurrentTeamTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.group = Group.objects.create(name="Test Users")
        self.user.groups.add(self.group)
        self.team = Team.objects.create()

        self.profile = Profile.objects.create(user=self.user, team=self.team)

        self.view = reverse("api:event:current-team")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        """
        When the user attempts to access the team, while it has no profile.
        The user must be accepted or waitlisted to have formed a team.
        """
        self.profile.delete()
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_has_profile(self):
        """
        When user has a profile and attempts to access the team, then the user
        should get the correct response.
        """
        self._login()
        response = self.client.get(self.view)
        team_expected = Team.objects.get(pk=self.team.pk)
        serializer = TeamSerializer(team_expected)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), serializer.data)
