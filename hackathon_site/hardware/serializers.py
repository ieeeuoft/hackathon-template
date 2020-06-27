from rest_framework import serializers
from hardware.models import Hardware, Category, Order


class HardwareSerializer(serializers.ModelSerializer):
    quantity_remaining = serializers.SerializerMethodField()

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
            "quantity_remaining",
        )

    def get_quantity_remaining(self, obj):
        return (
            obj.quantity_available
            - Order.objects.filter(items__hardware__id=obj.id).count()
        )


class CategorySerializer(serializers.ModelSerializer):
    hardware = HardwareSerializer(many=True, read_only=True)

    unique_hardware_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "max_per_team", "hardware", "unique_hardware_count")

    def get_unique_hardware_count(self, obj):
        return Hardware.objects.filter(categories__id=obj.id).count()
