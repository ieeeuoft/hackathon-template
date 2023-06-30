import datetime

from django.contrib.auth.models import Group
from django.core.exceptions import ObjectDoesNotExist
from django.conf import settings
from rest_framework import serializers

from event.models import Profile, User, Team
from registration.models import Application
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
            "phone_number",
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
            "phone_number",
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
            "phone_number",
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
            "phone_number",
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
        current_user = self.context["request"].user
        if hasattr(current_user, "profile"):
            raise serializers.ValidationError("User already has profile")

        is_test_user = (
            self.context["request"]
            .user.groups.filter(name=settings.TEST_USER_GROUP)
            .exists()
        )

        if not is_test_user:
            try:
                rsvp_status = Application.objects.get(user=current_user).rsvp
                if not rsvp_status and settings.RSVP:
                    raise serializers.ValidationError(
                        "User has not RSVP'd to the hackathon. Please RSVP to access the Hardware Signout Site"
                    )
            except Application.DoesNotExist:
                raise serializers.ValidationError(
                    "User has not completed their application to the hackathon. Please do so to access the Hardware Signout Site"
                )

            try:
                review = Review.objects.get(application__user=current_user)
                if review.status != "Accepted":
                    raise serializers.ValidationError(
                        f"User has not been accepted to participate in {settings.HACKATHON_NAME}"
                    )
                if review.decision_sent_date is None:
                    raise serializers.ValidationError(
                        "User has not been reviewed yet, Hardware Signout Site cannot be accessed until reviewed"
                    )
            except Review.DoesNotExist:
                raise serializers.ValidationError(
                    "User has not been reviewed yet, Hardware Signout Site cannot be accessed until reviewed"
                )

        acknowledge_rules = validated_data.pop("acknowledge_rules", None)
        e_signature = validated_data.pop("e_signature", None)

        if not acknowledge_rules or not e_signature:
            raise serializers.ValidationError(
                "User must acknowledge rules and provide an e_signature"
            )

        response_data = {
            "attended": True,
            "id_provided": False,
            "acknowledge_rules": acknowledge_rules,
            "e_signature": e_signature,
            "phone_number": "6471437544"
            if is_test_user
            else Application.objects.get(user=current_user).phone_number,
        }

        profile = Profile.objects.create(**{**response_data, "user": current_user})
        return {**response_data, "team": profile.team.team_code}


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
            "project_description",
        )
        read_only_fields = (
            "id",
            "team_code",
            "created_at",
            "updated_at",
            "profiles",
        )


class ProfileCreateResponseSerializer(ProfileSerializer):
    team = serializers.CharField(required=True)


class UserReviewStatusSerializer(serializers.ModelSerializer):
    review_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "first_name", "last_name", "email", "review_status")

    @staticmethod
    def get_review_status(user: User):
        try:
            review = Review.objects.get(application__user=user)
            return review.status if review.decision_sent_date is not None else "None"
        except ObjectDoesNotExist:
            return "None"
