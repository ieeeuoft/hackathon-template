from rest_framework import serializers
from hardware.models import Hardware, Category, OrderItem, Order


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

    @staticmethod
    def get_quantity_remaining(obj: Hardware):
        return (
            # Get all OrderItems with that HardwareId
            obj.quantity_available
            - OrderItem.objects.filter(hardware__id=obj.id)
            # Get all the ones where they have null returned health
            .filter(part_returned_health__isnull=True)
            # Exclude the ones with status of cart
            .exclude(order__status="Cart").count()
        )


class CategorySerializer(serializers.ModelSerializer):
    unique_hardware_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "max_per_team", "unique_hardware_count")

    @staticmethod
    def get_unique_hardware_count(obj: Category):
        return Hardware.objects.filter(categories__id=obj.id).count()


class OrderSerializer(serializers.ModelSerializer):
    hardware_set = HardwareSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "hardware_set", "team", "status", "created_at", "updated_at")
