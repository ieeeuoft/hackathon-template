from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status

from event.models import Team
from hardware.models import Hardware, Category, Order, OrderItem
from hardware.serializers import (
    HardwareSerializer,
    CategorySerializer,
    OrderListSerializer,
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


class OrderListViewGetTestCase(SetupUserMixin, APITestCase):
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
        expected_response = OrderListSerializer(
            queryset, many=True, context={"request": response.wsgi_request}
        ).data
        data = response.json()

        self.assertEqual(expected_response, data["results"])


class OrderListViewPostTestCase(SetupUserMixin, APITestCase):
    def setUp(self):
        super().setUp()
        self.team = Team.objects.create()
        self.category_A_limit_1 = Category.objects.create(
            name="category_limit_1", max_per_team=1
        )
        self.category_B_limit_10 = Category.objects.create(
            name="category_limit_10", max_per_team=10
        )
        self.view = reverse("api:hardware:order-list")

    def test_user_not_logged_in(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_has_no_profile(self):
        self._login()
        request_data = {"hardware": []}
        response = self.client.post(self.view, request_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_simple_order(self):
        self._login()
        profile = self._make_event_profile()
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

        order_id = response.json().get("order_id")
        self.assertIsNotNone(order_id, "No order id returned")

        order = Order.objects.get(pk=order_id)
        self.assertEqual(len(order.items.all()), 1, "More than 1 order item created")
        self.assertCountEqual(order.hardware_set.all(), [simple_hardware])

        pass

    def test_invalid_input_hardware_limit(self):
        self._login()
        profile = self._make_event_profile()
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
        hardware.categories.add(self.category_B_limit_10.pk)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        pass

    def test_invalid_input_hardware_limit_past_orders(self):
        self._login()
        profile = self._make_event_profile()
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
        hardware.categories.add(self.category_B_limit_10.pk)

        submitted_order = Order.objects.create(
            team=self.user.profile.team, status="Submitted"
        )
        submitted_order_item = OrderItem.objects.create(
            order=submitted_order, hardware=hardware
        )

        ready_order = Order.objects.create(
            team=self.user.profile.team, status="Ready for Pickup"
        )
        ready_order_item = OrderItem.objects.create(
            order=ready_order, hardware=hardware
        )

        picked_up_order = Order.objects.create(
            team=self.user.profile.team, status="Picked Up"
        )
        picked_up_order_item = OrderItem.objects.create(
            order=picked_up_order, hardware=hardware
        )

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        pass

    def test_returned_orders_hardware_limit(self):
        self._login()
        profile = self._make_event_profile()
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
        hardware.categories.add(self.category_B_limit_10.pk)

        order = Order.objects.create(team=self.user.profile.team, status="Picked Up")
        healthy_order_item = OrderItem.objects.create(order=order, hardware=hardware)
        healthy_order_item.part_returned_health = "Healthy"
        healthy_order_item.save()
        used_order_item = OrderItem.objects.create(order=order, hardware=hardware)
        used_order_item.part_returned_health = "Heavily Used"
        used_order_item.save()
        broken_order_item = OrderItem.objects.create(order=order, hardware=hardware)
        broken_order_item.part_returned_health = "Broken"
        broken_order_item.save()
        lost_order_item = OrderItem.objects.create(order=order, hardware=hardware)
        lost_order_item.part_returned_health = "Lost"
        lost_order_item.save()

        request_data = {"hardware": [{"id": hardware.id, "quantity": 4}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        pass
