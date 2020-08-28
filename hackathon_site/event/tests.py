from django.contrib.auth.models import Group
from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

import pytz


from event.models import Profile, Team, User
from event.serializers import TeamSerializer, UserSerializer, GroupSerializer, ProfileSerializer


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
        self.assertEqual(team_expected, team_serialized)

class UserSerializerTestCase(TestCase):
    def test_serializer(self):
        team = Team.objects.create()
        group = Group.objects.create(name="Test")
        user = User.objects.create()
        user.groups.add(group)

        profile = Profile.objects.create(
            user=user, 
            team=team,
        )
        

        user_serialized = UserSerializer(user).data
        profile_serialized = ProfileSerializer(user.profile).data
        group_serialized = GroupSerializer(user.groups).data

        user_expected = {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "profile": profile_serialized,
            "groups": group_serialized,
        }
        self.assertEqual(user_expected, user_serialized)

class GroupSerializerTestCase(TestCase):
    def test_serializer(self):
        group = Group.objects.create(name="Test")
        group_serialized = GroupSerializer(group).data
        group_expected = {
            "id": group.id,
            "name": group.name,
        }
        self.assertEqual(group_expected, group_serialized)

class ProfileSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password="foobar123",
            first_name="Foo",
            last_name="Bar",
        )

    def test_serializer(self):
        team = Team.objects.create()
        team_serialized = TeamSerializer(team).data

        profile = Profile.objects.create(user=self.user, team=team)
        profile_serialized = ProfileSerializer(profile).data
        profile_expected = {
            "id": profile.id,
            "status": profile.status,
            "id_provided": profile.id_provided,
            "attended": profile.attended,
            "acknowledge_rules": profile.acknowledge_rules,
            "e_signature": profile.e_signature,
            "team": team_serialized,
        }
        self.assertEqual(profile_expected, profile_serialized)

