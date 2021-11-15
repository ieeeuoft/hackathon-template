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
        read_only_fields = ("id", "team", "acknowledge_rules", "e_signature")

    def update(self, instance: Profile, validated_data):
        if not validated_data:
            raise serializers.ValidationError("no modifiable fields provided")
        return super().update(instance, validated_data)


class CurrentProfileSerializer(ProfileSerializer):
    class Meta(ProfileSerializer.Meta):
        read_only_fields = (
            "id",
            "team",
            "id_provided",
            "attended",
        )

    def update(self, instance: Profile, validated_data):
        if not validated_data:
            raise serializers.ValidationError("no modifiable fields provided")
        acknowledge_rules = validated_data.pop("acknowledge_rules", False)
        e_signature = validated_data.pop("e_signature", None)

        if not instance.acknowledge_rules and acknowledge_rules:
            instance.acknowledge_rules = acknowledge_rules
        if not instance.e_signature and e_signature:
            instance.e_signature = e_signature

        return serializers.ModelSerializer.update(self, instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "profile", "groups")
