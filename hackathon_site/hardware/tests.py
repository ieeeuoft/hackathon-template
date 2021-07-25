from django.test import TestCase
from rest_framework import serializers

from hardware.models import Hardware, Category, Order, OrderItem
from event.models import Team
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderSerializer,
)


class HardwareSerializerTestCase(TestCase):
    def setUp(self):
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

    def test_base_case_no_order_items(self):
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 4,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
        }

        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_in_cart(self):
        team = Team.objects.create()
        order = Order.objects.create(status="Cart", team=team)
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)

        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 4,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
        }
        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_returned(self):
        team = Team.objects.create()
        order = Order.objects.create(status="Picked Up", team=team)
        order_item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 3,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
        }
        data = hardware_serializer.data
        self.assertEqual(expected_response, data)


class HardwareQuantityRemainingTestCase(TestCase):
    def setUp(self):
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

    def test_base_case_no_order_items(self):
        hardware_serializer = HardwareSerializer(
            Hardware.objects.get(pk=self.hardware.pk)
        )
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 4)

    def test_some_items_none_returned(self):
        team = Team.objects.create()
        order = Order.objects.create(status="Picked Up", team=team)
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 2)

    def test_some_items_returned(self):
        team = Team.objects.create()
        order = Order.objects.create(status="Picked Up", team=team)
        order_item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 3)

    def test_some_items_in_cart(self):
        team = Team.objects.create()
        order = Order.objects.create(status="Cart", team=team)
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 4)


class CategorySerializerTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="category", max_per_team=4)

    def test_base_case_no_hardware(self):
        category_serializer = CategorySerializer(self.category)
        data = category_serializer.data
        expected_response = {
            "id": 1,
            "name": "category",
            "max_per_team": 4,
            "unique_hardware_count": 0,
        }
        self.assertEqual(expected_response, data)

    def test_unique_hardware_exists(self):
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.hardware.categories.add(self.category)
        category_serializer = CategorySerializer(self.category)
        data = category_serializer.data
        expected_response = {
            "id": 1,
            "name": "category",
            "max_per_team": 4,
            "unique_hardware_count": 1,
        }
        self.assertEqual(expected_response, data)


class OrderSerializerTestCase(TestCase):
    def setUp(self):
        self.team = Team.objects.create()
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.other_hardware = Hardware.objects.create(
            name="other",
            model_number="otherModel",
            manufacturer="otherManufacturer",
            datasheet="/datasheet/location/other/",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location/other/",
        )

    def test_empty_order(self):
        order = Order.objects.create(status="Cart", team=self.team)
        order_serializer = OrderSerializer(order).data
        expected_response = {
            "id": 1,
            "team": self.team.id,
            "status": "Cart",
            "hardware_set": [],
            "created_at": serializers.DateTimeField().to_representation(
                order.created_at
            ),
            "updated_at": serializers.DateTimeField().to_representation(
                order.updated_at
            ),
        }
        self.assertEqual(order_serializer, expected_response)

    def test_hardware_set(self):
        order = Order.objects.create(status="Cart", team=self.team)
        OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        OrderItem.objects.create(
            order=order, hardware=self.other_hardware,
        )
        self.hardware.refresh_from_db()
        self.other_hardware.refresh_from_db()
        order_serializer = OrderSerializer(order).data
        expected_response = {
            "id": 1,
            "team": self.team.id,
            "status": "Cart",
            "hardware_set": [
                HardwareSerializer(self.hardware).data,
                HardwareSerializer(self.other_hardware).data,
            ],
            "created_at": serializers.DateTimeField().to_representation(
                order.created_at
            ),
            "updated_at": serializers.DateTimeField().to_representation(
                order.updated_at
            ),
        }
        self.assertEqual(order_serializer, expected_response)
