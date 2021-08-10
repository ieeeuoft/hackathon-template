from collections import Counter
import functools
from django.db.models import Count, Q
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from hardware.models import Hardware, Category, OrderItem, Order


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
    def get_unique_hardware_count(obj: Category) -> int:
        return obj.hardware_set.annotate(Count("id", distinct=True)).count()


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
            Counter(),
        )

    # check that the requests are within per-team constraints
    def validate(self, data):
        try:
            user_profile = self.context["request"].user.profile
        except ObjectDoesNotExist:
            raise serializers.ValidationError("User does not have profile")
        # requested_hardware is a Counter where the keys are <Hardware Object>'s
        # and values are <Int>'s
        requested_hardware = self.merge_requests(hardware_requests=data["hardware"])
        if not requested_hardware:
            raise serializers.ValidationError("No hardware submitted")
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
                & Q(order_items__order__team=user_profile.team),
                distinct=True,
            )
        )
        category_counts = dict()
        error_messages = []
        for (hardware, requested_quantity) in requested_hardware.items():
            team_hardware = team_unreturned_orders.get(id=hardware.id)
            team_hardware_count = getattr(team_hardware, "past_order_count", 0)
            if (team_hardware_count + requested_quantity) > hardware.max_per_team:
                error_messages.append("Hardware {} limit reached".format(hardware.name))
            for category in hardware.categories.all():
                category_counts[category] = (
                    category_counts.get(category, 0)
                    + team_hardware_count
                    + requested_quantity
                )
        for (category, count) in category_counts.items():
            if count > category.max_per_team:
                error_messages.append("Category {} limit reached".format(category.name))
        if error_messages:
            raise serializers.ValidationError(error_messages)
        return data

    def create(self, validated_data):
        # validated data should already satisfy all constraints
        requested_hardware = self.merge_requests(
            hardware_requests=validated_data["hardware"]
        )
        new_order = None
        response_data = {"order_id": None, "hardware": [], "errors": []}
        order_items = []
        for (hardware, requested_quantity) in requested_hardware.items():
            num_order_items = min(hardware.quantity_remaining, requested_quantity)
            if num_order_items <= 0:
                response_data["hardware"].append(
                    {"hardware_id": hardware.id, "quantity_fulfilled": 0}
                )
                response_data["errors"].append(
                    {
                        "hardware_id": hardware.id,
                        "message": "There are no {}s available".format(hardware.name),
                    }
                )
                continue
            if new_order is None:
                new_order = Order.objects.create(
                    team=self.context["request"].user.profile.team, status="Submitted"
                )
                response_data["order_id"] = new_order.id
            order_items += [
                OrderItem(order=new_order, hardware=hardware)
                for _ in range(num_order_items)
            ]
            response_data["hardware"].append(
                {"hardware_id": hardware.id, "quantity_fulfilled": num_order_items}
            )
            if num_order_items != requested_quantity:
                response_data["errors"].append(
                    {
                        "hardware_id": hardware.id,
                        "message": "Only {} of {} {}(s) were available".format(
                            num_order_items, requested_quantity, hardware.name,
                        ),
                    }
                )
        if order_items:
            OrderItem.objects.bulk_create(order_items)
        return response_data


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
        queryset=Order.objects.all(), many=False, allow_null=True
    )
    hardware = OrderCreateResponseQuantitySerializer(many=True, required=True)
    errors = OrderCreateResponseErrorSerializer(many=True, required=True)
