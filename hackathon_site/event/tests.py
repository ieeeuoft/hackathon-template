from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from event.models import Profile, Team, User


class ProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password="foobar123",
            first_name="Foo",
            last_name="Bar",
        )

    def test_creates_profile_with_provided_team(self):
        team = Team.objects.create()
        profile = Profile.objects.create(user=self.user, team=team, status="Accepted")
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(profile.team, team)

    def test_creates_team_if_not_provided(self):
        profile = Profile.objects.create(user=self.user, status="Accepted")
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.first(), profile.team)


class IndexViewTestCase(TestCase):
    def test_index_view(self):
        url = reverse("event:index")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
