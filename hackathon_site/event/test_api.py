from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from hackathon_site.tests import SetupUserMixin
from django.contrib.auth.models import Permission

from event.models import Profile, User, Team
from event.serializers import (
    UserSerializer,
    TeamSerializer,
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


class JoinTeamTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()

        self.profile = Profile.objects.create(user=self.user, team=self.team)
        self.team_code = self.team.team_code
        self.view_name = "api:event:join-team"

    def _build_view(self, team_code):
        return reverse(self.view_name, kwargs={"team_code": team_code})

    def test_join_and_delete(self):
        """
        When a member wants to join a team, if their current team only includes
        them, their current team is deleted..
        """
        self._login()

        # A single-user team is created as part of the setup.
        team = self._make_event_team(self_users=False, num_users=2)
        self.client.post(self._build_view(team.team_code))
        self.assertFalse(self.team.profiles.exists())

    def test_invalid_key(self):
        self._login()
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_join_full_team(self):
        self._login()
        team = self._make_event_team(self_users=False)
        response = self.client.post(self._build_view(team.team_code))
        self.assertEqual(response.json(), {"detail": "Team is full"})

    def test_user_not_logged_in(self):
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.post(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def check_cannot_leave_active(self):
        old_team = self.profile.team
        sample_team = self._make_event_team(self_users=False, num_users=2)
        response = self.client.post(self._build_view(sample_team.team_code))
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(old_team.pk, self.user.profile.team.pk)

    def check_can_leave_cancelled(self):
        old_team = self.profile.team
        sample_team = self._make_event_team(self_users=False, num_users=2)
        response = self.client.post(self._build_view(sample_team.team_code))
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.user.profile.team.pk)
        self.assertNotEqual(old_team.pk, self.user.profile.team.pk)
        self.assertFalse(Team.objects.filter(team_code=old_team.team_code).exists())

    def test_cannot_leave_with_order(self):
        """
        check user cannot join another team when there
        are submitted orders, unless those orders are
        cancelled.
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
                self.check_cannot_leave_active()
            else:
                self.check_can_leave_cancelled()


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


class ProfileDetailViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.user_with_profile = User.objects.create_user(
            username="foo2@bar.com",
            password=self.password,
            first_name="Test2",
            last_name="Bar2",
            email="foo2@bar.com",
        )
        self.profile = self._make_event_profile(user=self.user_with_profile)
        self.request_body = {
            "id_provided": True,
            "attended": True,
            "acknowledge_rules": True,
            "e_signature": "user signature",
        }
        self.change_permissions = Permission.objects.filter(
            content_type__app_label="event", codename="change_profile"
        )

    def _build_view(self, id):
        return reverse("api:event:profile-detail", kwargs={"id": id})

    def _get_expected_response(self, profile):
        return {
            "id": profile.id,
            "id_provided": True,
            "attended": True,
            "acknowledge_rules": True,
            "e_signature": "user signature",
            "team": profile.team_id,
        }

    def test_user_not_logged_in(self):
        response = self.client.patch(self._build_view(1), self.request_body)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_change_permissions_or_profile(self):
        self._login()
        response = self.client.patch(self._build_view(1), self.request_body)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_change_permissions_no_profile(self):
        self._login(self.change_permissions)
        response = self.client.patch(
            self._build_view(self.profile.id), self.request_body
        )
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self._get_expected_response(self.profile), data)

    def test_user_has_only_profile(self):
        profile = self._make_event_profile()
        self._login()

        # Testing to get user's own profile
        response = self.client.patch(self._build_view(profile.id), self.request_body)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self._get_expected_response(profile), data)

        # Testing if user can see another user's profile
        response2 = self.client.patch(
            self._build_view(self.profile.id), self.request_body
        )
        data2 = response2.json()

        # User can only see their own profile even if they query another user's profile id
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(self._get_expected_response(profile), data2)

    def test_user_has_change_permissions_and_profile(self):
        self._make_event_profile()
        self._login(self.change_permissions)
        response = self.client.patch(
            self._build_view(self.profile.id), self.request_body
        )
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self._get_expected_response(self.profile), data)

    def test_modifying_acknowledge_rules_and_e_signature_twice(self):
        self._login(self.change_permissions)

        # First, normally update profile
        response = self.client.patch(
            self._build_view(self.profile.id), self.request_body
        )
        data = response.json()
        expected_response = self._get_expected_response(self.profile)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data)

        # Then update profile with a different request, changing acknowledge & e signature
        new_request_body = {
            "id_provided": False,
            "attended": False,
            "acknowledge_rules": False,
            "e_signature": "new signature",
        }
        # acknowledge_rules and e_signature do not change
        expected_response["id_provided"] = False
        expected_response["attended"] = False
        response2 = self.client.patch(
            self._build_view(self.profile.id), new_request_body
        )
        data2 = response2.json()
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data2)
