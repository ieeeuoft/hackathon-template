from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status

from event.models import Team
from hardware.models import Hardware, Category, Order, OrderItem
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderSerializer,
)
from hackathon_site.tests import SetupUserMixin


class HardwareListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()

        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.hardware_serializer = HardwareSerializer(self.hardware)
        self.view = reverse("api:hardware:hardware-list")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_hardware_get_success(self):
        self._login()
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
            "picture": "http://testserver/media/picture/location",
        }

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(expected_response, data["results"][0])


class HardwareDetailViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()

        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

        self.hardware_serializer = HardwareSerializer(self.hardware)
        self.view = reverse(
            "api:hardware:hardware-detail", kwargs={"pk": self.hardware.id}
        )

        # Test the categories
        for item in range(1, 6):
            category_name = "category" + str(item)
            self.hardware.categories.add(
                Category.objects.create(name=category_name, max_per_team=4)
            )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_hardware_get_success(self):
        self._login()

        expected_response = {
            "id": self.hardware.id,
            "name": "name",
            "categories": [category.id for category in self.hardware.categories.all()],
            "model_number": "model",
            "manufacturer": "manufacturer",
            "datasheet": "/datasheet/location/",
            "quantity_available": 4,
            "quantity_remaining": 4,
            "notes": None,
            "max_per_team": 1,
            "picture": "http://testserver/media/picture/location",
        }

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(expected_response, data)


class CategoryListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.category = Category.objects.create(name="category", max_per_team=4)
        self.category_serializer = CategorySerializer(self.category)
        self.view = reverse("api:hardware:category-list")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_category_get_success(self):
        self._login()

        expected_response = {
            "id": 1,
            "name": "category",
            "max_per_team": 4,
            "unique_hardware_count": 0,
        }

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertEqual(expected_response, data["results"][0])


class OrderListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(status="Cart", team=self.team)
        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        self.other_hardware = Hardware.objects.create(
            name="other",
            model_number="otherModel",
            manufacturer="otherManufacturer",
            datasheet="/datasheet/location/other",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location/other",
        )
        OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )
        OrderItem.objects.create(
            order=self.order, hardware=self.other_hardware,
        )
        self.order_2 = Order.objects.create(status="Submitted", team=self.team)
        OrderItem.objects.create(
            order=self.order_2, hardware=self.hardware,
        )
        OrderItem.objects.create(
            order=self.order_2, hardware=self.other_hardware,
        )
        self.view = reverse("api:hardware:order-list")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_hardware_get_success(self):
        self._login()

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        queryset = Order.objects.all()
        # need to provide a request in the serializer context to produce absolute url for image field
        expected_response = OrderSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])


class HardwareListTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()

        self.hardware1 = Hardware.objects.create(
            name="hardware1",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )

        self.hardware2 = Hardware.objects.create(
            name="arduino",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

        self.hardware3 = Hardware.objects.create(
            name="hardware3",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

        self.view = reverse("api:hardware:hardware-list")

        self.team = Team.objects.create()
        self.order = Order.objects.create(status="Submitted", team=self.team)

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_search_by_name(self):
        self._login()

        url = self._build_filter_url(search="arduino")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()

        self.assertEqual(len(data["results"]), 1)
        self.assertEqual(data["results"][0]["id"], 2)

    def test_in_stock_true(self):
        self._login()
        OrderItem.objects.create(hardware=self.hardware1, order=self.order)

        url = self._build_filter_url(in_stock="true")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertEqual(returned_ids, [2, 3])

    def test_in_stock_false(self):
        self._login()
        OrderItem.objects.create(hardware=self.hardware1, order=self.order)

        url = self._build_filter_url(in_stock="false")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertEqual(returned_ids, [1])

    def test_in_stock_not_present(self):
        self._login()
        OrderItem.objects.create(hardware=self.hardware1, order=self.order)

        url = self._build_filter_url(in_stock="")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]

        self.assertEqual(returned_ids, [1, 2, 3])

    def test_id_filter(self):
        self._login()

        url = self._build_filter_url(id="1,3")
        expected_data = {
            "count": 2,
            "next": None,
            "previous": None,
            "results": [
                {
                    "id": 1,
                    "name": "hardware1",
                    "model_number": "model",
                    "manufacturer": "manufacturer",
                    "datasheet": "/datasheet/location/",
                    "quantity_available": 0,
                    "notes": "notes",
                    "max_per_team": 1,
                    "picture": "http://testserver/media/picture/location",
                    "categories": [],
                    "quantity_remaining": 0,
                },
                {
                    "id": 3,
                    "name": "hardware3",
                    "model_number": "model",
                    "manufacturer": "manufacturer",
                    "datasheet": "/datasheet/location/",
                    "quantity_available": 4,
                    "notes": "notes",
                    "max_per_team": 1,
                    "picture": "http://testserver/media/picture/location",
                    "categories": [],
                    "quantity_remaining": 4,
                },
            ],
        }
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertEqual(returned_ids, [1,3])

    def test_id_invalid(self):
        self._login()

        url = self._build_filter_url(id="1,2,abcde")
        response = self.client.get(url)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(data, {"id": ["Enter a whole number."]})
