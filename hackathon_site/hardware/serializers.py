from collections import Counter
import functools
import itertools

from rest_framework import serializers

from hardware.models import Hardware, Category, OrderItem, Order
from event.models import Team as TeamEvent


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


class OrderListSerializer(serializers.ModelSerializer):
    hardware_set = HardwareSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ("id", "hardware_set", "team", "status", "created_at", "updated_at")


class OrderCreateSerializer(serializers.Serializer):
    class OrderCreateHardwareSerializer(serializers.Serializer):
        id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        quantity = serializers.IntegerField(required=True)

    team_id = serializers.PrimaryKeyRelatedField(
        queryset=TeamEvent.objects.all(), many=False, required=True
    )
    hardware = OrderCreateHardwareSerializer(many=True, required=True)

    @staticmethod
    def merge_requests(hardware_requests):
        return functools.reduce(
            lambda x, y: x + y,
            [Counter({e["id"]: e["quantity"]}) for e in hardware_requests],
        )

    def create(self, validated_data):
        requested_hardware = self.merge_requests(
            hardware_requests=validated_data["hardware"]
        )
        relevant_past_order_items = (
            OrderItem.objects.filter(hardware__in=requested_hardware.keys(),)
            .exclude(order__status="Cancelled")
            .select_related("hardware")
        )
        team_past_hardware_counts = Counter(
            (
                map(
                    lambda item: item.hardware,
                    relevant_past_order_items.filter(
                        order__team=validated_data["team_id"],
                    ).all(),
                )
            )
        )
        all_past_hardware_counts = Counter(
            (map(lambda item: item.hardware, relevant_past_order_items.all(),))
        )
        new_order = None
        unfulfilled_hardware_requests = dict()
        for (hardware, requested_quantity) in requested_hardware.items():
            allowed_quantity = min(
                hardware.max_per_team - team_past_hardware_counts[hardware],
                hardware.quantity_available - all_past_hardware_counts[hardware],
            )
            if allowed_quantity <= 0:
                unfulfilled_hardware_requests[hardware] = requested_quantity
                continue
            if new_order is None:
                new_order = Order.objects.create(
                    team=validated_data["team_id"], status="Submitted"
                )
            if allowed_quantity < requested_quantity:
                unfulfilled_hardware_requests[hardware] = (
                    requested_quantity - allowed_quantity
                )
            for _ in itertools.repeat(None, min(allowed_quantity, requested_quantity)):
                OrderItem.objects.create(
                    order=new_order, hardware=hardware,
                )

        return new_order, unfulfilled_hardware_requests


class OrderCreateResponseSerializer(serializers.Serializer):
    def to_representation(self, instance):
        response = {"order_id": instance.id}
        fulfilled_order_items = instance.items
        fulfilled_count = Counter(
            map(lambda item: item.hardware_id, fulfilled_order_items.all())
        )
        response["hardware"] = dict(fulfilled_count)
        unfulfilled = self.context["unfulfilled"]
        response["errors"] = {
            hardware.id: count for (hardware, count) in unfulfilled.items()
        }
        return response
