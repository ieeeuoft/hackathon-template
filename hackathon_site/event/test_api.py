from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from hackathon_site.tests import SetupUserMixin
from django.contrib.auth.models import Permission

from event.models import Profile, User, Team
from event.serializers import (
    TeamSerializer,
    UserSerializer,
)
from hardware.models import Hardware, Order, OrderItem


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


class LeaveTeamTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()

        self.profile = Profile.objects.create(user=self.user, team=self.team)

        self.view = reverse("api:event:leave-team")

    def test_user_not_logged_in(self):
        response = self.client.post(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.post(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def check_leave_and_delete(self):
        old_team = self.profile.team
        response = self.client.post(self.view)
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], self.user.profile.team.pk)
        self.assertNotEqual(old_team.pk, self.user.profile.team.pk)
        self.assertEqual(
            Team.objects.filter(team_code=old_team.team_code).exists(), False
        )

    def check_cannot_leave(self):
        old_team = self.profile.team
        response = self.client.post(self.view)
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(old_team.pk, self.user.profile.team.pk)
        self.assertEqual(Team.objects.filter(team_code=old_team.team_code).count(), 1)

    def test_leave_and_delete(self):
        """
        when there is no orders or other members on the team,
        user should be able to leave and be put on a new team
        """
        self._login()
        self.check_leave_and_delete()

    def test_leave_with_order(self):
        """
        when there are orders but no other members on the team,
        user can only leave when there are only cancelled orders
        """
        self._login()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        order = Order.objects.create(status="Cart", team=self.team)
        OrderItem.objects.create(order=order, hardware=hardware)

        for _, status_choice in Order.STATUS_CHOICES:
            order.status = status_choice
            order.save()
            if status_choice != "Cancelled":
                self.check_cannot_leave()
            else:
                self.check_leave_and_delete()

    def test_leave_with_not_empty_team(self):
        """
        when there are other members but no orders on the team,
        user can only leave but the old team stays
        """
        old_team = self.profile.team

        other_user = User.objects.create_user(
            username="other_user@bar.com",
            password=self.password,
            first_name="other_user",
            last_name="Bar",
            email="other_user@bar.com",
        )
        Profile.objects.create(user=other_user, team=self.profile.team)

        self._login()
        response = self.client.post(self.view)
        self.user.refresh_from_db()
        other_user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], self.user.profile.team.pk)
        self.assertNotEqual(old_team.pk, self.user.profile.team.pk)

        self.assertEqual(old_team.pk, other_user.profile.team.pk)
        self.assertEqual(
            Team.objects.filter(team_code=old_team.team_code).exists(), True
        )


class EventTeamListsViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):

        self.team = Team.objects.create()
        self.team2 = Team.objects.create()
        self.team3 = Team.objects.create()
        self.permissions = Permission.objects.filter(
            content_type__app_label="event", codename="view_team"
        )
        super().setUp()
        self.view = reverse("api:event:team-list")

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_team_get_no_permissions(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_team_get_has_permissions(self):
        self._login(self.permissions)
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        queryset = Team.objects.all()

        # need to provide a request in the serializer context to produce absolute url for image field
        expected_response = TeamSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_team_get_not_login(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_team_code_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(team_code=self.team.team_code)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["team_code"] for res in results]
        self.assertCountEqual(returned_ids, [self.team.team_code])

    def test_team_id_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(team_ids="1,3")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [1, 3])

    def test_name_search_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(search=self.team2.team_code)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["team_code"] for res in results]
        self.assertCountEqual(returned_ids, [self.team2.team_code])
