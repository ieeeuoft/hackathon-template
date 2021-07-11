from collections import Counter
import functools
import itertools

from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Count, Q
from rest_framework import serializers

from hardware.models import Hardware, Category, OrderItem, Order
from event.models import Team as TeamEvent


class HardwareSerializer(serializers.ModelSerializer):
    quantity_remaining = serializers.IntegerField()

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

    hardware = OrderCreateHardwareSerializer(many=True, required=True)

    @staticmethod
    def merge_requests(hardware_requests):
        # hardware_requests is a list where each element is an OrderedDict
        # with key value pairs
        # "id": <Hardware Object>, and
        # "quantity": <Int>
        return functools.reduce(
            lambda x, y: x + y,
            [Counter({e["id"]: e["quantity"]}) for e in hardware_requests],
        )

    # check that the requests are within per-team constraints
    def validate(self, data):
        # requested_hardware is a Counter where the keys are <Hardware Object>'s and values are <Int>'s
        requested_hardware = self.merge_requests(hardware_requests=data["hardware"])
        hardware_query = (
            Hardware.objects.filter(
                id__in=[hardware.id for hardware in requested_hardware.keys()],
            )
            .all()
            .prefetch_related("categories", "order_items")
        )
        team_unreturned_orders = hardware_query.annotate(
            past_order_count=Count(
                "order_items",
                filter=Q(order_items__part_returned_health__isnull=True)
                & ~Q(order_items__order__status="Cancelled")
                & Q(order_items__order__team=self.context["request"].user.profile.team),
                distinct=True,
            )
        )
        category_counts = dict()
        error_messages = []
        for (hardware, requested_quantity) in requested_hardware.items():
            team_hardware = team_unreturned_orders.get(id=hardware.id)
            team_hardware_count = getattr(team_hardware, "past_order_count", 0)
            if hardware.max_per_team < (team_hardware_count + requested_quantity):
                error_messages.append("Hardware {} limit reached".format(hardware.name))
            for category in hardware.categories.all():
                category_counts[category] = (
                    category_counts.get(category, 0)
                    + team_hardware_count
                    + requested_quantity
                )
        for (category, count) in category_counts.items():
            if category.max_per_team < count:
                error_messages.append("Category {} limit reached".format(category.name))
        if error_messages:
            error_message = "; ".join(error_messages)
            raise serializers.ValidationError(error_message)
        return data

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
    class OrderCreateResponseQuantitySerializer(serializers.Serializer):
        hardware_id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        quantity_fulfilled = serializers.IntegerField(required=True)

    class OrderCreateResponseErrorSerializer(serializers.Serializer):
        hardware_id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        message = serializers.CharField(
            max_length=None, min_length=None, allow_blank=False
        )

    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), many=False, required=True
    )
    hardware = OrderCreateResponseQuantitySerializer(many=True, required=True)
    errors = OrderCreateResponseErrorSerializer(many=True, required=True)
