from django.contrib.auth.models import Group
from rest_framework import serializers

from event.models import Profile, User, Team


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name")


class UserInSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email")


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


class ProfileInUserSerializer(serializers.ModelSerializer):
    user = UserInSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "id_provided",
            "attended",
            "acknowledge_rules",
            "e_signature",
            "user",
        )


class ProfileInTeamSerializer(serializers.ModelSerializer):
    user = UserInSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "id_provided",
            "attended",
            "acknowledge_rules",
            "e_signature",
            "user",
        )


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileInUserSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "profile", "groups")


class TeamSerializer(serializers.ModelSerializer):
    profiles = ProfileInTeamSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = (
            "id",
            "team_code",
            "created_at",
            "updated_at",
            "profiles",
        )
