from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from event.models import Profile, User


class CurrentUserTestCase(APITestCase):
    def setUp(self):
        self.password = "foobar123"
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password="foobar123",
            first_name="Test",
            last_name="Bar",
            email="foo@bar.com",
        )
        self.group = Group.objects.create(name="Test Users")
        self.user.groups.add(self.group)
        self.profile = Profile.objects.create(user=self.user, status="Accepted")

        self.view = reverse("api:event:current-user")

    def _login(self):
        self.client.login(username=self.user.username, password=self.password)

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self.profile.delete()
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_correct_response(self):
        expected_response = {
            "id": self.profile.id,
            "user": {
                **{
                    attr: getattr(self.user, attr)
                    for attr in ("id", "first_name", "last_name", "email")
                },
                "groups": [{"id": self.group.id, "name": self.group.name,}],
            },
            **{
                attr: getattr(self.profile, attr)
                for attr in (
                    "status",
                    "id_provided",
                    "attended",
                    "acknowledge_rules",
                    "e_signature",
                )
            },
        }
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data, expected_response)
