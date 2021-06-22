from django.contrib.auth.models import Group
from rest_framework import serializers

from event.models import Profile, User, Team


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name")


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = (
            "id",
            "team_code",
            "created_at",
            "updated_at",
        )


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = (
            "id",
            "id_provided",
            "attended",
            "acknowledge_rules",
            "e_signature",
            "team",
        )


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "profile", "groups")
