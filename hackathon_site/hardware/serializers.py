from collections import Counter
import functools
from datetime import datetime

from django.db.models import Count, Q
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.conf import settings
from rest_framework import serializers

from event.models import Profile
from hardware.models import Hardware, Category, OrderItem, Order, Incident


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
            "image_url",
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


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ("id", "hardware", "order", "part_returned_health")


class IncidentCreateSerializer(serializers.ModelSerializer):
    team_id = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = (
            "id",
            "state",
            "time_occurred",
            "description",
            "order_item",
            "team_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("team_id", "created_at", "updated_at")

    @staticmethod
    def get_team_id(obj: Incident) -> int:
        return obj.order_item.order.team.id if obj.order_item.order.team else None


class IncidentSerializer(IncidentCreateSerializer):
    order_item = OrderItemSerializer()


class IncidentPatchSerializer(serializers.ModelSerializer):
    team_id = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = (
            "id",
            "state",
            "time_occurred",
            "description",
            "order_item",
            "team_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "order_item", "team_id", "created_at", "updated_at")

    @staticmethod
    def get_team_id(obj: Incident) -> int:
        return obj.order_item.order.team.id if obj.order_item.order.team else None


class OrderItemInOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = (
            "id",
            "hardware_id",
            "part_returned_health",
        )


class OrderItemListSerializer(serializers.ModelSerializer):
    team_code = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()

    created_at = serializers.CharField(source="order.created_at")
    updated_at = serializers.CharField(source="order.updated_at")

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "order_id",
            "team_code",
            "created_at",
            "updated_at",
            "part_returned_health",
            "hardware",
        )

    @staticmethod
    def get_team_code(obj: OrderItem):
        return obj.order.team.team_code if obj.order.team else None

    @staticmethod
    def get_order_id(obj: OrderItem):
        return obj.order.id


class OrderListSerializer(serializers.ModelSerializer):
    items = OrderItemInOrderSerializer(many=True, read_only=True)
    team_code = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id",
            "items",
            "team_id",
            "team_code",
            "status",
            "created_at",
            "updated_at",
            "request",
        )

    @staticmethod
    def get_team_code(obj: Order):
        return obj.team.team_code if obj.team else None


class OrderChangeSerializer(OrderListSerializer):
    change_options = {
        "Submitted": ["Cancelled", "Ready for Pickup"],
        "Ready for Pickup": ["Picked Up", "Submitted"],
        "Picked Up": ["Returned"],
    }

    class Meta:
        model = Order
        fields = OrderListSerializer.Meta.fields
        read_only_fields = (
            "id",
            "hardware",
            "team",
            "team_code",
            "created_at",
            "updated_at",
        )

    def validate_status(self, data):
        current_status = self.instance.status

        if current_status not in self.change_options:
            raise serializers.ValidationError(
                "Cannot change the status for this order."
            )

        if data not in self.change_options[current_status]:
            raise serializers.ValidationError(
                f"Cannot change the status of an order from {current_status} to {data}."
            )
        return data

    def update(self, instance: Order, validated_data):
        status = validated_data.pop("status", None)
        request = validated_data.pop("request", None)

        if status is not None:
            instance.status = status
        if request is not None:
            for item in request:
                items_in_order = list(
                    OrderItem.objects.filter(hardware=item["id"], order=instance.pk)
                )
                num_items_in_order = len(items_in_order)
                requested_number = item["requested_quantity"]

                if requested_number > num_items_in_order:
                    raise serializers.ValidationError(
                        f"Cannot increase the number of Hardware item number {items_in_order[0].hardware} to more than the originally ordered {requested_number} items."
                    )
                for idx in range(0, num_items_in_order):
                    if idx < num_items_in_order - requested_number:
                        items_in_order[idx].part_returned_health = "Rejected"
                    else:
                        items_in_order[idx].part_returned_health = None
                    items_in_order[idx].save()

        return serializers.ModelSerializer.update(self, instance, validated_data)


class TeamOrderChangeSerializer(OrderChangeSerializer):
    change_options = {
        "Submitted": ["Cancelled"],
    }


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
        if (
            not self.context["request"]
            .user.groups.filter(name=settings.TEST_USER_GROUP)
            .exists()
        ):
            # time restrictions
            if datetime.now(settings.TZ_INFO) < settings.HARDWARE_SIGN_OUT_START_DATE:
                raise serializers.ValidationError(
                    "Hardware sign out period has not begun"
                )
            if datetime.now(settings.TZ_INFO) > settings.HARDWARE_SIGN_OUT_END_DATE:
                raise serializers.ValidationError("Hardware sign out period is over")

        # permission restrictions
        try:
            user_profile = self.context["request"].user.profile
        except ObjectDoesNotExist:
            raise serializers.ValidationError("User does not have profile")

        # team size restrictions
        team_size = Profile.objects.filter(team__exact=user_profile.team).count()
        if team_size < settings.MIN_MEMBERS or team_size > settings.MAX_MEMBERS:
            raise serializers.ValidationError(
                "User's team does not meet team size criteria"
            )
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
            if hardware.quantity_remaining - requested_quantity < 0:
                error_messages.append(
                    f"Unable to order Hardware {hardware.name} because there are not enough items in stock"
                )
            elif (team_hardware_count + requested_quantity) > hardware.max_per_team:
                error_messages.append(
                    "Maximum number of items for Hardware {} is reached (limit of {} per team)".format(
                        hardware.name, hardware.max_per_team
                    )
                )
            for category in hardware.categories.all():
                category_counts[category] = (
                    category_counts.get(category, 0)
                    + team_hardware_count
                    + requested_quantity
                )
        for (category, count) in category_counts.items():
            if count > category.max_per_team:
                error_messages.append(
                    "Maximum number of items for the Category {} is reached (limit of {} items per team)".format(
                        category.name, category.max_per_team
                    )
                )
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

        # The reason why doing this is because the id field stores the hardware object, django cannot translate hardware object into JSON. Therefore, loop has been used to get the hardware id and quantity requested
        serialized_requested_hardware = []
        for (hardware, requested_quantity) in requested_hardware.items():
            serialized_requested_hardware.append(
                {"id": hardware.id, "requested_quantity": requested_quantity}
            )

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
                    team=self.context["request"].user.profile.team,
                    status="Submitted",
                    request=serialized_requested_hardware,
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


class OrderItemReturnSerializer(serializers.Serializer):
    class HardwareItemReturnSerializer(serializers.Serializer):
        HEALTH_CHOICES = ["Healthy", "Heavily Used", "Broken", "Lost"]
        id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        quantity = serializers.IntegerField(required=True)
        part_returned_health = serializers.CharField(max_length=64, required=True)

    hardware = HardwareItemReturnSerializer(many=True, required=True)
    order = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), many=False, required=True
    )

    def validate(self, data):
        # get array of hardware and order id from data parameter
        hardware_array = data["hardware"]
        if len(hardware_array) < 1:
            raise ValidationError("No hardware specified in return request")
        return data

    def create(self, validated_data):
        hardware = validated_data["hardware"]
        order = validated_data["order"]
        order_items_in_order = OrderItem.objects.filter(order=order)

        response_data = {
            "order_id": order.id,
            "returned_items": [],
            "team_code": order.team.team_code,
            "errors": [],
        }

        for hardware_item in hardware:
            if (
                hardware_item["part_returned_health"]
                not in OrderItemReturnSerializer.HardwareItemReturnSerializer.HEALTH_CHOICES
            ):
                response_data["errors"].append(
                    {
                        "hardware_id": hardware_item["id"].id,
                        "message": f"Invalid part health return status for hardware item {hardware_item['id'].name}",
                    }
                )
                continue

            order_items_with_hardware = list(
                order_items_in_order.filter(
                    hardware=hardware_item["id"], part_returned_health__isnull=True
                )
            )
            num_checked_out_order_items = len(order_items_with_hardware)

            if num_checked_out_order_items == 0 and hardware_item["quantity"] > 0:
                response_data["errors"].append(
                    {
                        "hardware_id": hardware_item["id"].id,
                        "message": f"There are no checked out items for hardware item {hardware_item['id'].name} for order #{order}.",
                    }
                )

            max_available_quantity = hardware_item["quantity"]
            if num_checked_out_order_items < hardware_item["quantity"]:
                max_available_quantity = num_checked_out_order_items
                if num_checked_out_order_items > 0:
                    response_data["errors"].append(
                        {
                            "hardware_id": hardware_item["id"].id,
                            "message": f"Requested quantity of {hardware_item['quantity']} for hardware {hardware_item['id'].name} was higher than available. {max_available_quantity} {'was' if max_available_quantity == 1 else 'were'} returned.",
                        }
                    )

            for quantity_idx in range(max_available_quantity):
                order_items_with_hardware[
                    quantity_idx
                ].part_returned_health = hardware_item["part_returned_health"]
                order_items_with_hardware[quantity_idx].save()

            if max_available_quantity > 0:
                response_data["returned_items"].append(
                    {
                        "hardware_id": hardware_item["id"].id,
                        "quantity": max_available_quantity,
                    }
                )

        return response_data


class OrderItemReturnResponseSerializer(serializers.Serializer):
    class OrderReturnResponseErrorSerializer(serializers.Serializer):
        hardware_id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        message = serializers.CharField(
            max_length=None, min_length=None, allow_blank=False
        )

    class OrderReturnResponseReturnItemSerializer(serializers.Serializer):
        hardware_id = serializers.PrimaryKeyRelatedField(
            queryset=Hardware.objects.all(), many=False, required=True
        )
        quantity = serializers.IntegerField(required=True)

    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(), many=False, required=True
    )
    team_code = serializers.CharField(required=True)
    returned_items = OrderReturnResponseReturnItemSerializer(many=True, required=True)
    errors = OrderReturnResponseErrorSerializer(many=True, required=True)
