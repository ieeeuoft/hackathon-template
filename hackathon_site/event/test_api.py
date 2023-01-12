from django.conf import settings
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

from hardware.serializers import OrderListSerializer
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
        order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )

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
        other_user = User.objects.create_user(
            username="other_user@bar.com",
            password=self.password,
            first_name="other_user",
            last_name="Bar",
            email="other_user@bar.com",
        )
        Profile.objects.create(team=self.profile.team, user=other_user)
        old_team = self.profile.team
        response = self.client.post(self.view)
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], self.user.profile.team.pk)
        self.assertNotEqual(old_team.pk, self.user.profile.team.pk)
        self.assertEqual(
            Team.objects.filter(team_code=old_team.team_code).exists(), True
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
        order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
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

    def test_team_id_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(team_ids="1,3")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [1, 3])

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
        }
        self.change_permissions = Permission.objects.filter(
            content_type__app_label="event", codename="change_profile"
        )
        self.expected_response = {
            "id": self.profile.id,
            "id_provided": True,
            "attended": True,
            "acknowledge_rules": False,
            "e_signature": None,
            "team": self.profile.team_id,
            "phone_number": "1234567890",
        }
        self.view = reverse("api:event:profile-detail", kwargs={"pk": self.profile.id})

    def test_user_not_logged_in(self):
        response = self.client.patch(self.view, self.request_body)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_change_permissions(self):
        self._login()
        response = self.client.patch(self.view, self.request_body)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_change_permissions(self):
        self._login(self.change_permissions)
        response = self.client.patch(self.view, self.request_body)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.expected_response, data)

    def test_partially_modifying_profile(self):
        self._login(self.change_permissions)

        # only modifying id_provided
        request_body = {"id_provided": True}
        expected_response = {
            "id": self.profile.id,
            "id_provided": True,
            "attended": False,
            "acknowledge_rules": False,
            "e_signature": None,
            "team": self.profile.team_id,
            "phone_number": "1234567890",
        }

        response = self.client.patch(self.view, request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data)


class CurrentProfileViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.profile = self._make_event_profile(user=self.user)
        self.request_body = {
            "acknowledge_rules": True,
            "e_signature": "user signature",
        }
        self.expected_response = {
            "id": self.profile.id,
            "id_provided": False,
            "attended": False,
            "acknowledge_rules": True,
            "e_signature": "user signature",
            "team": self.profile.team_id,
            "phone_number": "1234567890",
        }
        self.view = reverse("api:event:current-profile")

    def test_user_not_logged_in(self):
        response = self.client.patch(self.view, self.request_body)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.patch(self.view, self.request_body)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_profile(self):
        self._login()

        # Testing to get user's own profile
        response = self.client.patch(self.view, self.request_body)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.expected_response, data)

    def test_modifying_acknowledge_rules_and_e_signature_twice(self):
        self._login()

        # First, normally update profile
        response = self.client.patch(self.view, self.request_body)
        data = response.json()
        expected_response = self.expected_response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data)

        # Then update profile with a different request, changing acknowledge & e signature
        new_request_body = {
            "acknowledge_rules": False,
            "e_signature": "new signature",
        }
        # acknowledge_rules and e_signature do not change
        response2 = self.client.patch(self.view, new_request_body)
        data2 = response2.json()
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data2)

    def test_partially_modifying_profile(self):
        self._login()

        # only modifying acknowledge_rules
        request_body = {"acknowledge_rules": True}
        expected_response = {
            "id": self.profile.id,
            "id_provided": False,
            "attended": False,
            "acknowledge_rules": True,
            "e_signature": None,
            "team": self.profile.team_id,
            "phone_number": "1234567890",
        }

        response = self.client.patch(self.view, request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(expected_response, data)


class CreateProfileViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.request_body = {
            "acknowledge_rules": True,
            "e_signature": "user signature",
        }
        self.expected_response = {
            "attended": True,
            "id_provided": False,
            "acknowledge_rules": True,
            "e_signature": "user signature",
            "phone_number": "1234567890",
        }
        self.view = reverse("api:event:current-profile")

    def test_user_not_logged_in(self):
        response = self.client.post(self.view, self.request_body)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_have_profile(self):
        self._review(application=self._apply_as_user(self.user, rsvp=True))
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()

        profile_created = Profile.objects.get(user=self.user)
        self.assertIsNotNone(profile_created)

        self.expected_response = {
            **self.expected_response,
            "team": profile_created.team.team_code,
        }

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(self.expected_response, data)

    def test_not_including_required_fields(self):
        self._review(application=self._apply_as_user(self.user, rsvp=True))
        self._login()
        response = self.client.post(self.view, {"e_signature": "user signature",})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.post(self.view, {"acknowledge_rules": True,})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_acknowledge_rules_is_false(self):
        self._review(application=self._apply_as_user(self.user, rsvp=True))
        self._login()
        response = self.client.post(
            self.view, {"e_signature": "user signature", "acknowledge_rules": False,},
        )
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0], "User must acknowledge rules and provide an e_signature"
        )

    def test_e_signature_is_empty(self):
        self._review(application=self._apply_as_user(self.user, rsvp=True))
        self._login()
        response = self.client.post(
            self.view, {"e_signature": "", "acknowledge_rules": True,},
        )
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0], "User must acknowledge rules and provide an e_signature"
        )

    def test_user_already_has_profile(self):
        self._make_event_profile(user=self.user)
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(data[0], "User already has profile")

    def test_user_has_not_completed_application(self):
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0],
            "User has not completed their application to the hackathon. Please do so to access the Hardware Signout Site",
        )

    def test_user_has_not_rsvp(self):
        self._apply_as_user(self.user)
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0],
            "User has not RSVP'd to the hackathon. Please RSVP to access the Hardware Signout Site",
        )

    def test_user_has_not_been_reviewed(self):
        self._apply_as_user(self.user, rsvp=True)
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0],
            "User has not been reviewed yet, Hardware Signout Site cannot be accessed until reviewed",
        )

    def test_user_review_rejected(self):
        self._review(
            application=self._apply_as_user(self.user, rsvp=True), status="Rejected"
        )
        self._login()
        response = self.client.post(self.view, self.request_body)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            data[0],
            f"User has not been accepted to participate in {settings.HACKATHON_NAME}",
        )


class CurrentTeamOrderListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart", team=self.team, request={"hardware": []}
        )
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.other_hardware = Hardware.objects.create(
            name="other",
            model_number="otherModel",
            manufacturer="otherManufacturer",
            datasheet="/datasheet/location/other",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location/other",
        )
        OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )
        OrderItem.objects.create(
            order=self.order, hardware=self.other_hardware,
        )

        # making extra data to test if team data is being filtered
        self.team2 = Team.objects.create(team_code="ABCDE")
        self.order_2 = Order.objects.create(
            status="Submitted", team=self.team2, request={"hardware": []}
        )
        OrderItem.objects.create(
            order=self.order_2, hardware=self.hardware,
        )
        OrderItem.objects.create(
            order=self.order_2, hardware=self.other_hardware,
        )

        self.view = reverse("api:event:team-orders")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_profile(self):
        Profile.objects.create(user=self.user, team=self.team)
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        queryset = Order.objects.filter(team_id=self.team.id)

        expected_response = OrderListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])


class TeamIncidentListViewPostTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )

        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.order_item = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )

        self.request_data = {
            "state": "Broken",
            "time_occurred": "2022-08-08T01:18:00-04:00",
            "description": "Description",
            "order_item": self.order_item.id,
        }

        self.view = reverse("api:event:incident-list")

    def test_user_not_logged_in(self):
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_no_profile(self):
        self._login()
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_another_team_incident(self):
        self.team2 = Team.objects.create()
        self.other_hardware = Hardware.objects.create(
            name="other",
            model_number="otherModel",
            manufacturer="otherManufacturer",
            datasheet="/datasheet/location/other",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location/other",
        )
        self.order2 = Order.objects.create(
            status="Cart",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        self.order_item2 = OrderItem.objects.create(
            order=self.order2, hardware=self.other_hardware,
        )

        request_data = {
            "state": "Broken",
            "time_occurred": "2022-08-08T01:18:00-04:00",
            "description": "Description",
            "order_item": self.order_item2.id,
        }

        self._login()
        Profile.objects.create(user=self.user, team=self.team)

        response = self.client.post(self.view, request_data)

        self.assertEqual(
            response.json(), {"detail": "Can only create incidents for your own team."}
        )

    def test_successful_post(self):
        self._login()
        Profile.objects.create(user=self.user, team=self.team)
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        similar_attributes = [
            "state",
            "time_occurred",
            "description",
            "order_item",
        ]
        final_response = response.json()
        del final_response["id"]
        for attribute in similar_attributes:
            self.assertEqual(final_response[attribute], self.request_data[attribute])


class EventTeamDetailViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self, **kwargs):

        self.team = Team.objects.create()
        self.team2 = Team.objects.create()
        self.team3 = Team.objects.create()
        self.permissions = Permission.objects.filter(
            content_type__app_label="event", codename="view_team"
        )
        super().setUp()

    def _build_view(self, team_code):
        return reverse("api:event:team-detail", kwargs={"team_code": team_code})

    def test_team_get_not_login(self):
        response = self.client.get(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_team_get_no_permissions(self):
        self._login()
        response = self.client.get(self._build_view("56ABD"))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_team_get_has_permissions(self):
        self._login(self.permissions)
        response = self.client.get(self._build_view(self.team.team_code))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        queryset = Team.objects.filter(team_code=self.team)

        expected_response = TeamSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data

        data = response.json()

        self.assertEqual(expected_response[0], data)


class TeamOrderDetailViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.profile = Profile.objects.create(user=self.user, team=self.team)
        self.view_name = "api:event:team-order-detail"
        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        order = Order.objects.create(
            status="Submitted",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        OrderItem.objects.create(order=order, hardware=hardware)
        self.pk = order.id
        self.request_data = {"status": "Cancelled"}

    def _build_view(self, pk):
        return reverse(self.view_name, kwargs={"pk": pk})

    def test_user_not_logged_in(self):
        response = self.client.patch(self._build_view(self.pk), self.request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_successful_status_change(self):
        self._login()
        response = self.client.patch(self._build_view(self.pk), self.request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            self.request_data["status"], Order.objects.get(id=self.pk).status
        )

    def test_unallowed_status_change(self):
        self._login()
        request_data = {"status": "Picked Up"}
        response = self.client.patch(self._build_view(self.pk), request_data)
        self.assertFalse(request_data["status"] == Order.objects.get(id=self.pk).status)
        self.assertEqual(
            response.json(),
            {
                "status": [
                    f"Cannot change the status of an order from {Order.objects.get(id=self.pk).status} to {request_data['status']}."
                ]
            },
        )

    def test_failed_beginning_status(self):
        self._login()
        order = Order.objects.create(
            status="Picked Up",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        response = self.client.patch(self._build_view(order.id), self.request_data)
        self.assertEqual(
            response.json(), {"status": ["Cannot change the status for this order."]},
        )
        self.assertFalse(
            self.request_data["status"] == Order.objects.get(id=self.pk).status
        )

    def test_cannot_change_other_team_order(self):
        self._login()
        self.team2 = Team.objects.create()
        order = Order.objects.create(
            status="Submitted",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        response = self.client.patch(self._build_view(order.id), self.request_data)
        self.assertEqual(
            response.json(), {"detail": "Can only change the status of your orders."},
        )
        self.assertFalse(
            self.request_data["status"] == Order.objects.get(id=self.pk).status
        )


class CurrentUserReviewStatusTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.view = reverse("api:event:current-user-review-status")

    def get_expected_response(self, review_status):
        return {
            **{
                attr: getattr(self.user, attr)
                for attr in ("id", "first_name", "last_name", "email")
            },
            "review_status": review_status,
        }

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_application(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(self.get_expected_response("None"), data)

    def test_user_has_no_review(self):
        self.application = self._apply_as_user(self.user)
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(self.get_expected_response("None"), data)

    def test_user_has_review_and_application(self):
        self.application = self._apply_as_user(self.user)
        self._review()
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(self.get_expected_response("Accepted"), data)
