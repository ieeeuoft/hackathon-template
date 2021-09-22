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
        self.team_code = self.team.team_code
        self.view_name = "api:event:join-team"

    def _build_view(self, team_code):
        return reverse(self.view_name, kwargs={"team_code": team_code})

    def test_invalid_key(self):
        self._login()
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_join_full_team(self):
        self._login()
        team = self._make_full_event_team(self_users=False)
        print(team.team_code)
        response = self.client.post(self._build_view(team.team_code))

    def test_user_not_logged_in(self):
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

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
