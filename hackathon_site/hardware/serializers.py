from rest_framework import serializers
from hardware.models import Hardware, Category


class HardwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hardware
        fields = (
            "id",
            "name",
            "model_number",
            "manufacturer",
            "datasheet",
            "quantity_available",
            "notes",
            "max_per_team",
            "picture",
            "categories",
        )


class CategorySerializer(serializers.ModelSerializer):
    hardware = HardwareSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ("id", "name", "max_per_team", "hardware")
