from django.test import TestCase

from hardware.models import Hardware, Category
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

    def test_hardware_serializer(self):
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


class CategorySerializerTestCase(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="category", max_per_team=4)

    def test_category_serializer(self):
        category_serializer = CategorySerializer(self.category)
        data = category_serializer.data
        expected_response = {
            "id": 1,
            "name": "category",
            "max_per_team": 4,
            "unique_hardware_count": 0,
        }
        self.assertEqual(expected_response, data)
