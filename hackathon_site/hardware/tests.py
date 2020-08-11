from django.test import TestCase

from hardware.models import Hardware, Category, Order, OrderItem
from event.models import Team
from hardware.serializers import HardwareSerializer, CategorySerializer


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
            "picture": "picture/location",
        }

        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_in_cart(self):
        hardware_serializer = HardwareSerializer(self.hardware)
        team = Team.objects.create()
        order = Order.objects.create(status="Cart", team=team)
        order_item_1 = OrderItem.objects.create(order=order, hardware=self.hardware,)
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
            "picture": "picture/location",
        }
        data = hardware_serializer.data
        self.assertEqual(expected_response, data)

    def test_some_items_returned(self):
        hardware_serializer = HardwareSerializer(self.hardware)
        team = Team.objects.create()
        order = Order.objects.create(status="Picked Up", team=team)
        order_item_1 = OrderItem.objects.create(
            order=order, hardware=self.hardware, part_returned_health="Healthy"
        )
        order_item_2 = OrderItem.objects.create(order=order, hardware=self.hardware,)

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
            "picture": "picture/location",
        }
        data = hardware_serializer.data
        self.assertEqual(expected_response, data)


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
