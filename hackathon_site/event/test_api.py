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


class JoinTeamTestCase(SetupUserMixin, APITestCase):
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
        self.assertEqual(str(response.content),'b\'{"detail":"Team is full"}\'')

    def test_user_not_logged_in(self):
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def check_cannot_join(self):
        old_team = self.profile.team
        response = self.client.post(self._build_view(self.team.team_code))
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(old_team.pk, self.user.profile.team.pk)
        self.assertEqual(Team.objects.filter(team_code=old_team.team_code).count(), 1)

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

        self.team = self._make_full_event_team(self_users=False,num_users=3)

        order = Order.objects.create(status="Cart", team=self.team)
        OrderItem.objects.create(order=order, hardware=hardware)

        for _, status_choice in Order.STATUS_CHOICES:
            order.status = status_choice
            order.save()
            if status_choice != "Cancelled":
                self.check_cannot_join()
