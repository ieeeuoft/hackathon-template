from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

import pytz


from event.models import Profile, Team, User
from event.serializers import TeamSerializer


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


class TeamSerializerTestCase(TestCase):
    def test_serializer(self):
        tz = pytz.timezone(settings.TIME_ZONE)

        team = Team.objects.create()
        team_serialized = TeamSerializer(team).data
        team_expected = {
            "id": team.id,
            "team_code": team.team_code,
            "created_at": team.created_at.astimezone(tz).isoformat(),
            "updated_at": team.updated_at.astimezone(tz).isoformat(),
        }
