from django.test import TestCase
from rest_framework import serializers

from hardware.models import Hardware, Category, Order, OrderItem, Incident
from event.models import Team
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderListSerializer,
    IncidentSerializer,
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

        self.category1 = Category.objects.create(name="category1", max_per_team=4)
        self.category2 = Category.objects.create(name="category2", max_per_team=4)

        self.hardware.categories.add(self.category1, self.category2)

    def test_base_case_no_order_items(self):
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [self.category1.id, self.category2.id],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 4,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
            "image_url": None,
        }

        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_cancelled(self):
        team = Team.objects.create()
        order = Order.objects.create(
            status="Cancelled",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)

        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [self.category1.id, self.category2.id],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 4,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
            "image_url": None,
        }
        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_returned(self):
        team = Team.objects.create()
        order = Order.objects.create(
            status="Picked Up",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)

        expected_response = {
            "id": 1,
            "name": "name",
            "categories": [self.category1.id, self.category2.id],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 3,
            "notes": None,
            "max_per_team": 1,
            "picture": "/media/picture/location",
            "image_url": None,
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
        order = Order.objects.create(
            status="Picked Up",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 2)

    def test_some_items_returned_healthy(self):
        team = Team.objects.create()
        order = Order.objects.create(
            status="Picked Up",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 3)

    def test_some_items_returned_not_healthy(self):
        team = Team.objects.create()
        order = Order.objects.create(
            status="Picked Up",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Broken"
        )
        OrderItem.objects.create(
            order=order, hardware=self.hardware,
        )
        self.hardware.refresh_from_db()
        hardware_serializer = HardwareSerializer(self.hardware)
        self.assertEqual(hardware_serializer.data["quantity_remaining"], 2)

    def test_some_items_cancelled(self):
        team = Team.objects.create()
        order = Order.objects.create(
            status="Cancelled",
            team=team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
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


class IncidentSerializerTestCase(TestCase):
    def setUp(self):
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Picked Up",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )

        self.category = Category.objects.create(name="category", max_per_team=4)
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

        self.order_item_1 = OrderItem.objects.create(
            order=self.order, hardware=self.hardware, part_returned_health="Healthy"
        )
        self.incident = Incident.objects.create(
            state="Broken",
            description="Description",
            time_occurred=serializers.DateTimeField().to_representation(
                self.order.created_at
            ),
            created_at=serializers.DateTimeField().to_representation(
                self.order.created_at
            ),
            updated_at=serializers.DateTimeField().to_representation(
                self.order.created_at
            ),
            order_item_id=self.order_item_1.id,
        )

    def test_base(self):
        incident_serializer = IncidentSerializer(self.incident)
        data = incident_serializer.data
        data["order_item"] = dict(data["order_item"])
        expected_response = {
            "id": 1,
            "state": "Broken",
            "time_occurred": serializers.DateTimeField().to_representation(
                self.order.created_at
            ),
            "description": "Description",
            "order_item": {
                "id": 1,
                "hardware": 1,
                "order": 1,
                "part_returned_health": "Healthy",
            },
            "team_id": 1,
            "created_at": serializers.DateTimeField().to_representation(
                self.incident.created_at
            ),
            "updated_at": serializers.DateTimeField().to_representation(
                self.incident.updated_at
            ),
        }

        self.assertEqual(expected_response, data)


class OrderListSerializerTestCase(TestCase):
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
        order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        order_serializer = OrderListSerializer(order).data
        expected_response = {
            "id": 1,
            "team_id": self.team.id,
            "team_code": self.team.team_code,
            "status": "Cart",
            "items": [],
            "created_at": serializers.DateTimeField().to_representation(
                order.created_at
            ),
            "updated_at": serializers.DateTimeField().to_representation(
                order.updated_at
            ),
            "request": {
                "hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]
            },
        }

        self.assertEqual(order_serializer, expected_response)

    def test_hardware_set(self):
        order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        item_2 = OrderItem.objects.create(order=order, hardware=self.other_hardware,)
        self.hardware.refresh_from_db()
        self.other_hardware.refresh_from_db()
        order_serializer = OrderListSerializer(order).data
        expected_response = {
            "id": 1,
            "team_id": self.team.id,
            "team_code": self.team.team_code,
            "status": "Cart",
            "items": [
                {
                    "id": item_1.id,
                    "part_returned_health": "Healthy",
                    "hardware_id": self.hardware.id,
                },
                {
                    "id": item_2.id,
                    "part_returned_health": None,
                    "hardware_id": self.other_hardware.id,
                },
            ],
            "created_at": serializers.DateTimeField().to_representation(
                order.created_at
            ),
            "updated_at": serializers.DateTimeField().to_representation(
                order.updated_at
            ),
            "request": {
                "hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]
            },
        }
        self.assertEqual(order_serializer, expected_response)
