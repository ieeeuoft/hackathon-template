from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from event.models import Profile, User, Team
from review.models import Review


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ("id", "name")


class UserInProfileSerializer(serializers.ModelSerializer):
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
    user = UserInProfileSerializer(read_only=True)

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
    user = UserInProfileSerializer(read_only=True)

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

    def update(self, instance: Profile, validated_data):
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
        acknowledge_rules = validated_data.pop("acknowledge_rules", False)
        e_signature = validated_data.pop("e_signature", None)

        if not instance.acknowledge_rules and acknowledge_rules:
            instance.acknowledge_rules = acknowledge_rules
        if not instance.e_signature and e_signature:
            instance.e_signature = e_signature

        # This uses the original model serializer update function because calling super().update() will call
        # ProfileSerializer update function and we want to keep the logic between these two update functions separate.
        return serializers.ModelSerializer.update(self, instance, validated_data)

    def create(self, validated_data):
        if hasattr(self.context["request"].user, "profile"):
            raise serializers.ValidationError("User already has profile")

        acknowledge_rules = validated_data.pop("acknowledge_rules", None)
        e_signature = validated_data.pop("e_signature", None)

        if not acknowledge_rules or not e_signature:
            raise serializers.ValidationError(
                "Must have acknowledge_rules and e_signature"
            )

        response_data = {
            "attended": True,
            "id_provided": False,
            "acknowledge_rules": acknowledge_rules,
            "e_signature": e_signature,
        }

        profile = Profile.objects.create(
            **{**response_data, "user": self.context["request"].user}
        )

        return {**response_data, "team": profile.team.team_code, "id": profile.id}


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


class ProfileCreateResponseSerializer(ProfileSerializer):
    team = serializers.CharField()
    id = serializers.IntegerField()


class UserReviewStatusSerializer(serializers.ModelSerializer):
    review_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "review_status")

    @staticmethod
    def get_review_status(user: User):
        try:
            return Review.objects.get(application__user=user).status
        except ObjectDoesNotExist:
            return "None"
