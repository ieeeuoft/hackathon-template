from django.contrib.auth.models import Group
from rest_framework import serializers

from event.models import Profile, User


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name")


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "groups")


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = (
            "id",
            "user",
            "status",
            "id_provided",
            "attended",
            "acknowledge_rules",
            "e_signature",
        )
