from datetime import datetime

from dateutil.relativedelta import relativedelta
from django.contrib.auth.models import Permission, Group
from django.test import override_settings
from django.urls import reverse
from django.conf import settings

from rest_framework import status, serializers
from rest_framework.test import APITestCase

from event.models import Team, User, Profile
from hardware.models import Hardware, Category, Order, OrderItem, Incident
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderListSerializer,
    OrderItemListSerializer,
    IncidentSerializer,
)
from hackathon_site.tests import SetupUserMixin


class HardwareListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()

        self.hardware1 = Hardware.objects.create(
            name="aHardware",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )

        self.hardware2 = Hardware.objects.create(
            name="bHardware",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )

        self.hardware3 = Hardware.objects.create(
            name="cHardware",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=5,
            max_per_team=1,
            picture="/picture/location",
        )

        self.category1 = Category.objects.create(name="category1", max_per_team=4)
        self.category2 = Category.objects.create(name="category2", max_per_team=4)
        self.category3 = Category.objects.create(name="category3", max_per_team=4)

        self.hardware1.categories.add(self.category1)
        self.hardware2.categories.add(self.category1, self.category2)
        self.hardware3.categories.add(self.category3)

        self.view = reverse("api:hardware:hardware-list")

        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Submitted",
            team=self.team,
            request={
                "hardware": [
                    {"id": 1, "quantity": 2},
                    {"id": 2, "quantity": 3},
                    {"id": 3, "quantity": 2},
                ]
            },
        )

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_hardware_get_success(self):
        self._login()

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertCountEqual(
            [res["id"] for res in data["results"]],
            [self.hardware1.id, self.hardware2.id, self.hardware3.id],
        )

    def test_search_by_name(self):
        self._login()

        url = self._build_filter_url(search="bHardware")
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
        self.assertCountEqual(returned_ids, [2, 3])

    def test_in_stock_false(self):
        self._login()
        OrderItem.objects.create(hardware=self.hardware1, order=self.order)

        url = self._build_filter_url(in_stock="false")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [1])

    def test_in_stock_not_present(self):
        self._login()
        OrderItem.objects.create(hardware=self.hardware1, order=self.order)

        url = self._build_filter_url(in_stock="")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]

        self.assertCountEqual(returned_ids, [1, 2, 3])

    def test_id_filter(self):
        self._login()

        url = self._build_filter_url(hardware_ids="1,3")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [1, 3])

    def test_id_invalid(self):
        self._login()

        url = self._build_filter_url(hardware_ids="1,2,abcde")
        response = self.client.get(url)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(data, {"hardware_ids": ["Enter a whole number."]})

    def test_category_filter(self):
        self._login()

        url = self._build_filter_url(category_ids="1,2")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        returned_ids = [res["id"] for res in data["results"]]
        self.assertCountEqual(returned_ids, [1, 2])

    def test_category_invalid(self):
        self._login()

        url = self._build_filter_url(category_ids="1,abcde")
        response = self.client.get(url)
        data = response.json()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(data, {"category_ids": ["Enter a whole number."]})

    def test_order_by_name(self):
        self._login()

        order_asc = [1, 2, 3]

        for order in ["+", "-"]:
            url = self._build_filter_url(ordering=f"{order}name")
            response = self.client.get(url)
            data = response.json()
            returned_ids = [res["id"] for res in data["results"]]

            if order == "+":
                self.assertEqual(returned_ids, order_asc, msg="ascending")
            else:
                self.assertEqual(returned_ids, order_asc[::-1], msg="descending")

    def test_order_by_quantity_remaining(self):
        self._login()

        order_asc = [1, 2, 3]

        for order in ["", "-"]:
            url = self._build_filter_url(ordering=f"{order}quantity_remaining")
            response = self.client.get(url)
            data = response.json()
            returned_ids = [res["id"] for res in data["results"]]

            if order == "":
                self.assertEqual(returned_ids, order_asc, msg="ascending")
            else:
                self.assertEqual(returned_ids, order_asc[::-1], msg="descending")


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
            "image_url": None,
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

    def test_hardware_quantity_success(self):
        self._login()

        category2 = Category.objects.create(name="Microcontrollers", max_per_team=4)
        hardware1 = Hardware.objects.create(name="Arduino", quantity_available=2)
        hardware2 = Hardware.objects.create(name="ESP32", quantity_available=3)

        hardware1.categories.add(category2)
        hardware1.categories.add(self.category)
        hardware2.categories.add(category2)

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        expected_unique_hardware_counts = [1, 2]
        actual_unique_hardware_counts = [
            result["unique_hardware_count"] for result in data["results"]
        ]

        self.assertEqual(expected_unique_hardware_counts, actual_unique_hardware_counts)


class IncidentListViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="view_incident"
        )
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
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
        self.order_item = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )

        self.order_item2 = OrderItem.objects.create(
            order=self.order, hardware=self.other_hardware,
        )

        self.incident = Incident.objects.create(
            state="Broken",
            description="Description",
            order_item=self.order_item,
            time_occurred=datetime(2022, 8, 8, tzinfo=settings.TZ_INFO),
        )

        self.incident2 = Incident.objects.create(
            state="Missing",
            description="Description",
            order_item=self.order_item2,
            time_occurred=datetime(2022, 8, 8, tzinfo=settings.TZ_INFO),
        )
        self.view = reverse("api:hardware:incident-list")

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_view_permissions(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_incident_get_success(self):
        self._login(self.permissions)

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        queryset = Incident.objects.all()
        # need to provide a request in the serializer context to produce absolute url for image field
        expected_response = IncidentSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_hardware_id_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(hardware_id="1")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [1])

    def test_team_id_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(team_id="1")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]

        self.assertCountEqual(returned_ids, [1, 2])

    def test_name_search_filter(self):
        self._login(self.permissions)

        url = self._build_filter_url(search="other")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [2])


class OrderListViewGetTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.team2 = Team.objects.create(team_code="ABCDE")
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
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
        self.order_2 = Order.objects.create(
            status="Submitted",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        OrderItem.objects.create(
            order=self.order_2, hardware=self.hardware,
        )
        OrderItem.objects.create(
            order=self.order_2, hardware=self.other_hardware,
        )
        self.order_3 = Order.objects.create(
            status="Cancelled",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        OrderItem.objects.create(
            order=self.order_3, hardware=self.hardware,
        )
        self.order_4 = Order.objects.create(
            status="Submitted",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        OrderItem.objects.create(
            order=self.order_4, hardware=self.hardware,
        )
        self.view_permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="view_order"
        )
        self.view = reverse("api:hardware:order-list")

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_view_permissions(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_view_permissions(self):
        self._login(self.view_permissions)
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        queryset = Order.objects.all()

        # need to provide a request in the serializer context to produce absolute url for image field
        expected_response = OrderListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_orders_get_success(self):
        self._login(self.view_permissions)

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        queryset = Order.objects.all()
        expected_response = OrderListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_team_id_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(team_id="1")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [self.order.id, self.order_2.id])

    def test_team_code_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(team_code="ABCDE")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [self.order_3.id, self.order_4.id])

    def test_status_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(status="Cart")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [self.order.id])

    def test_created_at_ordering_ascending(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(ordering="created_at")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertEqual(
            returned_ids,
            [self.order.id, self.order_2.id, self.order_3.id, self.order_4.id],
        )

    def test_created_at_ordering_descending(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(ordering="-created_at")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertEqual(
            returned_ids,
            [self.order_4.id, self.order_3.id, self.order_2.id, self.order.id],
        )

    def test_search_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(search="ABCDE")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(returned_ids, [self.order_3.id, self.order_4.id])


class OrderItemListViewGetTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.team2 = Team.objects.create(team_code="ABCDE")
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
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
        self.order_item_1 = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )
        self.order_item_2 = OrderItem.objects.create(
            order=self.order, hardware=self.other_hardware,
        )
        self.order_2 = Order.objects.create(
            status="Submitted",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        self.order_item_3 = OrderItem.objects.create(
            order=self.order_2, hardware=self.hardware,
        )
        self.order_item_4 = OrderItem.objects.create(
            order=self.order_2, hardware=self.other_hardware,
        )
        self.order_3 = Order.objects.create(
            status="Cancelled",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        self.order_item_5 = OrderItem.objects.create(
            order=self.order_3, hardware=self.hardware,
        )
        self.order_4 = Order.objects.create(
            status="Submitted",
            team=self.team2,
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        self.order_item_6 = OrderItem.objects.create(
            order=self.order_4, hardware=self.hardware,
        )
        self.view_permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="view_orderitem"
        )
        self.view = reverse("api:hardware:order-item-list")

    def _build_filter_url(self, **kwargs):
        return (
            self.view + "?" + "&".join([f"{key}={val}" for key, val in kwargs.items()])
        )

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_view_permissions(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_user_has_view_permissions(self):
        self._login(self.view_permissions)
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        queryset = OrderItem.objects.all()

        # need to provide a request in the serializer context to produce absolute url for image field
        expected_response = OrderItemListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_order_items_get_success(self):
        self._login(self.view_permissions)

        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        queryset = OrderItem.objects.all()
        expected_response = OrderItemListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])

    def test_team_code_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(team_code="ABCDE")

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(
            returned_ids, [self.order_item_5.id, self.order_item_6.id]
        )

    def test_order_id_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(order_id=1)

        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]
        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(
            returned_ids, [self.order_item_1.id, self.order_item_2.id]
        )

    def test_search_filter(self):
        self._login(self.view_permissions)

        url = self._build_filter_url(search="ABCDE")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        results = data["results"]

        returned_ids = [res["id"] for res in results]
        self.assertCountEqual(
            returned_ids, [self.order_item_5.id, self.order_item_6.id]
        )


class IncidentListViewPostTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        self.permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="add_incident"
        )

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

        self.order_item = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )

        self.request_data = {
            "state": "Broken",
            "time_occurred": "2022-08-08T01:18:00-04:00",
            "description": "Description",
            "order_item": self.order_item.id,
        }

        self.view = reverse("api:hardware:incident-list")

    def test_user_not_logged_in(self):
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_incorrect_permissions(self):
        self._login()
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_successful_post(self):
        self._login(self.permissions)
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        similar_attributes = [
            "state",
            "time_occurred",
            "description",
            "order_item",
        ]
        final_response = response.json()
        del final_response["id"]
        for attribute in similar_attributes:
            self.assertEqual(final_response[attribute], self.request_data[attribute])


class IncidentDetailViewGetTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 1}]},
        )
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

        self.order_item = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )

        self.incident = Incident.objects.create(
            state="Broken",
            description="Description",
            order_item=self.order_item,
            time_occurred=datetime(2022, 8, 8, tzinfo=settings.TZ_INFO),
        )

        self.view_permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="view_incident"
        )

        self.view = reverse("api:hardware:incident-detail", args=[self.incident.id])

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_with_profile_and_no_view_permission(self):
        Profile.objects.create(user=self.user)
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_incorrect_permissions(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_incident_get_success(self):
        self._login(self.view_permissions)
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        queryset = Incident.objects.get(id=self.incident.id)
        expected_response = IncidentSerializer(queryset).data
        data = response.json()
        self.assertEqual(expected_response, data)


class OrderListViewPostTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()

        self.user2 = User.objects.create_user(
            username="frank@johnston.com",
            password="hellothere31415",
            email="frank@johnston.com",
            first_name="Frank",
            last_name="Johnston",
        )
        self.user3 = User.objects.create_user(
            username="franklin@carmichael.com",
            password="supersecret456",
            email="franklin@carmichael.com",
            first_name="Franklin",
            last_name="Carmichael",
        )
        self.user4 = User.objects.create_user(
            username="lawren@harris.com",
            password="wxyz7890",
            email="lawren@harris.com",
            first_name="Lawren",
            last_name="Harris",
        )

        self.user5 = User.objects.create_user(
            username="law@henn.com",
            password="wxyzdfs890",
            email="law@henn.com",
            first_name="Law",
            last_name="Henn",
        )

        self.category_limit_1 = Category.objects.create(
            name="category_limit_1", max_per_team=1
        )
        self.category_limit_4 = Category.objects.create(
            name="category_limit_4", max_per_team=4
        )
        self.category_limit_10 = Category.objects.create(
            name="category_limit_10", max_per_team=10
        )
        self.view = reverse("api:hardware:order-list")

    def create_min_number_of_profiles(self):
        Profile.objects.create(user=self.user, team=self.team)
        Profile.objects.create(user=self.user2, team=self.team)

    def create_order(self):
        self.hardware1 = Hardware.objects.create(
            name="aHardware",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=5,
            picture="/picture/location",
        )

        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2},]},
        )

        self.category1 = Category.objects.create(name="category1", max_per_team=4)

        self.hardware1.categories.add(self.category1)

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self._login()
        request_data = {"hardware": []}
        response = self.client.post(self.view, request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @override_settings(
        HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO)
        + relativedelta(days=1)
    )
    def test_submitting_order_before_start_date(self):
        self._login()
        self.create_min_number_of_profiles()
        simple_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )
        request_data = {"hardware": [{"id": simple_hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")
        expected_response = {
            "non_field_errors": ["Hardware sign out period has not begun"]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(
        HARDWARE_SIGN_OUT_END_DATE=datetime.now(settings.TZ_INFO)
        - relativedelta(days=1),
        HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO),
    )
    def test_submitting_order_after_end_date(self):
        self._login()
        self.create_min_number_of_profiles()
        simple_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )
        request_data = {"hardware": [{"id": simple_hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")
        expected_response = {"non_field_errors": ["Hardware sign out period is over"]}
        self.assertEqual(response.json(), expected_response)

    @override_settings(
        HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO)
        + relativedelta(days=1)
    )
    def test_submitting_order_as_test_user_before_start_date_success(self):
        self.group = Group.objects.get(name=settings.TEST_USER_GROUP)
        self.user.groups.add(self.group)
        self._login()
        self.create_min_number_of_profiles()
        simple_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )

        request_data = {"hardware": [{"id": simple_hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 1,
            "hardware": [{"hardware_id": simple_hardware.id, "quantity_fulfilled": 1}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=1)
        self.assertEqual(order.items.count(), 1, "More than 1 order item created")
        self.assertCountEqual(order.hardware.all(), [simple_hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_create_simple_order(self):
        self._login()
        self.create_min_number_of_profiles()

        simple_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=1,
            picture="/picture/location",
        )

        request_data = {"hardware": [{"id": simple_hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 1,
            "hardware": [{"hardware_id": simple_hardware.id, "quantity_fulfilled": 1}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=1)
        self.assertEqual(order.items.count(), 1, "More than 1 order item created")
        self.assertCountEqual(order.hardware.all(), [simple_hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_invalid_input_hardware_limit(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=1,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_response = {
            "non_field_errors": [
                "Maximum number of items for Hardware {} is reached (limit of {} per team)".format(
                    hardware.name, hardware.max_per_team
                )
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_invalid_input_hardware_limit_past_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=4,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        submitted_order = Order.objects.create(
            team=self.user.profile.team,
            status="Submitted",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        submitted_order_item = OrderItem.objects.create(
            order=submitted_order, hardware=hardware
        )

        ready_order = Order.objects.create(
            team=self.user.profile.team,
            status="Ready for Pickup",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        ready_order_item = OrderItem.objects.create(
            order=ready_order, hardware=hardware
        )

        picked_up_order = Order.objects.create(
            team=self.user.profile.team,
            status="Picked Up",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        picked_up_order_item = OrderItem.objects.create(
            order=picked_up_order, hardware=hardware
        )

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_response = {
            "non_field_errors": [
                "Maximum number of items for Hardware {} is reached (limit of {} per team)".format(
                    hardware.name, hardware.max_per_team
                )
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_hardware_limit_returned_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=4,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Picked Up",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        healthy_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Healthy"
        )
        used_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Heavily Used"
        )
        broken_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Broken"
        )
        lost_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Lost"
        )

        request_data = {"hardware": [{"id": hardware.id, "quantity": 4}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 2,
            "hardware": [{"hardware_id": hardware.id, "quantity_fulfilled": 4}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=2)
        self.assertEqual(order.items.count(), 4)
        self.assertCountEqual(order.hardware.all(), [hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_hardware_limit_cancelled_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=1,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Cancelled",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item = OrderItem.objects.create(order=order, hardware=hardware)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 2,
            "hardware": [{"hardware_id": hardware.id, "quantity_fulfilled": 1}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=2)
        self.assertEqual(order.items.all().count(), 1)
        self.assertCountEqual(order.hardware.all(), [hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_invalid_input_category_limit(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_1.pk)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_response = {
            "non_field_errors": [
                "Maximum number of items for the Category {} is reached (limit of {} items per team)".format(
                    self.category_limit_1.name, self.category_limit_1.max_per_team
                )
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_invalid_input_category_limit_past_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_4.pk)

        submitted_order = Order.objects.create(
            team=self.user.profile.team,
            status="Submitted",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        submitted_order_item = OrderItem.objects.create(
            order=submitted_order, hardware=hardware
        )

        ready_order = Order.objects.create(
            team=self.user.profile.team,
            status="Ready for Pickup",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        ready_order_item = OrderItem.objects.create(
            order=ready_order, hardware=hardware
        )

        picked_up_order = Order.objects.create(
            team=self.user.profile.team,
            status="Picked Up",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        picked_up_order_item = OrderItem.objects.create(
            order=picked_up_order, hardware=hardware
        )

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_response = {
            "non_field_errors": [
                "Maximum number of items for the Category {} is reached (limit of {} items per team)".format(
                    self.category_limit_4.name, self.category_limit_4.max_per_team
                )
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_category_limit_returned_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_4.pk)

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Picked Up",
            request={"hardware": [{"id": 1, "quantity": 2}, {"id": 2, "quantity": 3}]},
        )
        healthy_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Healthy"
        )
        used_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Heavily Used"
        )
        broken_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Broken"
        )
        lost_order_item = OrderItem.objects.create(
            order=order, hardware=hardware, part_returned_health="Lost"
        )

        request_data = {"hardware": [{"id": hardware.id, "quantity": 4}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 2,
            "hardware": [{"hardware_id": hardware.id, "quantity_fulfilled": 4}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=2)
        self.assertEqual(order.items.count(), 4)
        self.assertCountEqual(order.hardware.all(), [hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_category_limit_cancelled_orders(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_1.pk)

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Cancelled",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item = OrderItem.objects.create(order=order, hardware=hardware)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 2,
            "hardware": [{"hardware_id": hardware.id, "quantity_fulfilled": 1}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=2)
        self.assertEqual(order.items.count(), 1)
        self.assertCountEqual(order.hardware.all(), [hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_invalid_inputs_multiple_hardware(self):
        self._login()
        self.create_min_number_of_profiles()

        limited_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=1,
            picture="/picture/location",
        )
        limited_hardware.categories.add(self.category_limit_10.pk)

        limited_category_hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        limited_category_hardware.categories.add(self.category_limit_1.pk)

        request_data = {
            "hardware": [
                {"id": limited_hardware.id, "quantity": 10},
                {"id": limited_category_hardware.id, "quantity": 10},
            ]
        }
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_error_messages = [
            "Maximum number of items for the Category {} is reached (limit of {} items per team)".format(
                self.category_limit_1.name, self.category_limit_1.max_per_team
            ),
            "Maximum number of items for Hardware {} is reached (limit of {} per team)".format(
                limited_hardware.name, limited_hardware.max_per_team
            ),
        ]
        self.assertCountEqual(
            response.json().get("non_field_errors"), expected_error_messages
        )

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_multiple_hardware_success(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware_1 = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware_1.categories.add(self.category_limit_10.pk)

        hardware_2 = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=4,
            picture="/picture/location",
        )
        hardware_2.categories.add(self.category_limit_4.pk)

        num_hardware_1_requested = 6
        num_hardware_2_requested = 4

        request_data = {
            "hardware": [
                {"id": hardware_1.id, "quantity": num_hardware_1_requested},
                {"id": hardware_2.id, "quantity": num_hardware_2_requested},
            ]
        }
        response = self.client.post(self.view, request_data, format="json")
        response_json = response.json()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order_id = response_json.get("order_id")
        self.assertEqual(order_id, 1)

        response_hardware = response_json.get("hardware")
        self.assertEqual(len(response_hardware), 2)
        expected_response_hardware_1 = {
            "hardware_id": hardware_1.id,
            "quantity_fulfilled": num_hardware_1_requested,
        }
        expected_response_hardware_2 = {
            "hardware_id": hardware_2.id,
            "quantity_fulfilled": num_hardware_2_requested,
        }
        self.assertCountEqual(
            response_hardware,
            [expected_response_hardware_1, expected_response_hardware_2],
        )

        self.assertEqual(response_json.get("errors"), [])

        order = Order.objects.get(pk=order_id)
        self.assertCountEqual(order.hardware.all(), [hardware_1, hardware_2])
        self.assertEqual(
            order.items.filter(hardware=hardware_1).count(), num_hardware_1_requested
        )
        self.assertEqual(
            order.items.filter(hardware=hardware_2).count(), num_hardware_2_requested
        )

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_repeated_hardware_input_ids(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        num_hardware_requested = 6

        request_data = {
            "hardware": [
                {"id": hardware.id, "quantity": 1}
                for _ in range(num_hardware_requested)
            ]
        }
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 1,
            "hardware": [
                {
                    "hardware_id": hardware.id,
                    "quantity_fulfilled": num_hardware_requested,
                }
            ],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=1)
        self.assertEqual(order.items.all().count(), num_hardware_requested)
        self.assertCountEqual(order.hardware.all(), [hardware])

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_limited_by_remaining_quantities(self):
        # we won't test the other contributing causes for "remaining quantities"
        # because they should be covered by the tests for remaining quantity field
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=6,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        # these two must add up to be no greater than the smaller one of
        # hardware limit and category limit
        num_hardware_requested = 5
        num_existing_orders = 3

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Submitted",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        OrderItem.objects.bulk_create(
            [
                OrderItem(order=order, hardware=hardware)
                for _ in range(num_existing_orders)
            ]
        )

        request_data = {
            "hardware": [{"id": hardware.id, "quantity": num_hardware_requested}]
        }
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        expected_response = {
            "non_field_errors": [
                f"Unable to order Hardware {hardware.name} because there are not enough items in stock"
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_empty_input(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=10,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        request_data = {"hardware": []}
        response = self.client.post(self.view, request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        expected_response = {"non_field_errors": ["No hardware submitted"]}
        self.assertEqual(response.json(), expected_response)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 0}]}
        response = self.client.post(self.view, request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        expected_response = {"non_field_errors": ["No hardware submitted"]}
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_no_remaining_quantities(self):
        self._login()
        self.create_min_number_of_profiles()

        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=1,
            max_per_team=10,
            picture="/picture/location",
        )
        hardware.categories.add(self.category_limit_10.pk)

        order = Order.objects.create(
            team=self.user.profile.team,
            status="Submitted",
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        order_item = OrderItem.objects.create(order=order, hardware=hardware)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        expected_response = {
            "non_field_errors": [
                f"Unable to order Hardware {hardware.name} because there are not enough items in stock"
            ]
        }
        self.assertEqual(response.json(), expected_response)

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_team_less_min_order(self):
        self._login()
        self.create_order()
        Profile.objects.create(user=self.user, team=self.team)

        request_data = {"hardware": [{"id": self.hardware1.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")
        self.assertEqual(
            response.json(),
            {"non_field_errors": ["User's team does not meet team size criteria"]},
        )

    @override_settings(HARDWARE_SIGN_OUT_START_DATE=datetime.now(settings.TZ_INFO))
    def test_team_more_max_order(self):
        self._login()
        self.create_order()

        self.create_min_number_of_profiles()
        Profile.objects.create(user=self.user3, team=self.team)
        Profile.objects.create(user=self.user4, team=self.team)
        Profile.objects.create(user=self.user5, team=self.team)

        request_data = {"hardware": [{"id": self.hardware1.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")
        self.assertEqual(
            response.json(),
            {"non_field_errors": ["User's team does not meet team size criteria"]},
        )


class OrderListPatchTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.view_name = "api:hardware:order-detail"
        self.change_permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="change_order"
        )
        hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            quantity_available=4,
            max_per_team=1,
            picture="/picture/location",
        )
        order = Order.objects.create(
            status="Submitted",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        OrderItem.objects.create(order=order, hardware=hardware)
        self.pk = order.id

    def _build_view(self, pk):
        return reverse(self.view_name, kwargs={"pk": pk})

    def test_user_not_logged_in(self):
        request_data = {"status": "Ready for Pickup"}
        response = self.client.patch(self._build_view(self.pk), request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_lack_perms(self):
        self._login()
        request_data = {"status": "Ready for Pickup"}
        response = self.client.patch(self._build_view(self.pk), request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_successful_status_change(self):
        self._login(self.change_permissions)
        request_data = {"status": "Ready for Pickup"}
        response = self.client.patch(self._build_view(self.pk), request_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(request_data["status"], Order.objects.get(id=self.pk).status)

    def test_unallowed_status_change(self):
        self._login(self.change_permissions)
        request_data = {"status": "Picked Up"}
        response = self.client.patch(self._build_view(self.pk), request_data)
        self.assertFalse(request_data["status"] == Order.objects.get(id=self.pk).status)
        self.assertEqual(
            response.json(),
            {
                "status": [
                    f"Cannot change the status of an order from {Order.objects.get(id=self.pk).status} to {request_data['status']}."
                ]
            },
        )

    def test_failed_beginning_status(self):
        """
        Test to ensure an order status that is not changeable is not changed.
        """
        self._login(self.change_permissions)
        request_data = {"status": "Cancelled"}
        order = Order.objects.create(
            status="Picked Up",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        response = self.client.patch(self._build_view(order.id), request_data)
        self.assertEqual(
            response.json(), {"status": ["Cannot change the status for this order."]},
        )
        self.assertFalse(request_data["status"] == Order.objects.get(id=self.pk).status)


class OrderItemReturnViewTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.order = Order.objects.create(
            status="Cart",
            team=self.team,
            request={"hardware": [{"id": 1, "quantity": 2}]},
        )
        self.permissions = Permission.objects.filter(
            content_type__app_label="hardware", codename="change_order"
        )

        self.hardware = Hardware.objects.create(
            name="name",
            model_number="model",
            manufacturer="manufacturer",
            datasheet="/datasheet/location/",
            notes="notes",
            quantity_available=4,
            max_per_team=3,
            picture="/picture/location",
        )

        self.order_item = OrderItem.objects.create(
            order=self.order, hardware=self.hardware,
        )

        self.request_data = {
            "hardware": [{"id": 1, "quantity": 1, "part_returned_health": "Healthy"}],
            "order": self.order_item.id,
        }

        self.view = reverse("api:hardware:order-return")

    def test_user_not_logged_in(self):
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_incorrect_permissions(self):
        self._login()
        response = self.client.post(self.view, self.request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # TODO: https://ieeeuoft.atlassian.net/browse/IEEE-224
    # def test_successful_status_change(self):
    #     self._login(self.permissions)
    #     response = self.client.post(self.view, self.request_data)
    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(
    #         self.request_data["hardware"][0]["part_returned_health"],
    #         OrderItem.objects.get(id=self.order_item.id).part_returned_health,
    #     )
    #
    # def test_successful_post(self):
    #     self._login()
    #     response = self.client.post(self.view, self.request_data)
    #     self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    #     similar_attributes = [
    #         "state",
    #         "time_occurred",
    #         "description",
    #         "order_item",
    #     ]
    #     final_response = response.json()
    #     del final_response["id"]
    #     for attribute in similar_attributes:
    #         self.assertEqual(final_response[attribute], self.request_data[attribute])
