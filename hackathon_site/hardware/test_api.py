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
        self.order = Order.objects.create(status="Submitted", team=self.team)

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

        expected_response = {
            "order_id": 1,
            "hardware": [{"hardware_id": simple_hardware.id, "quantity_fulfilled": 1}],
            "errors": [],
        }

        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=1)
        self.assertEqual(order.items.count(), 1, "More than 1 order item created")
        self.assertCountEqual(order.hardware_set.all(), [simple_hardware])

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
        hardware.categories.add(self.category_limit_10.pk)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 2}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        expected_response = {
            "non_field_errors": ["Hardware {} limit reached".format(hardware.name)]
        }
        self.assertEqual(response.json(), expected_response)

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
        hardware.categories.add(self.category_limit_10.pk)

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

        expected_response = {
            "non_field_errors": ["Hardware {} limit reached".format(hardware.name)]
        }
        self.assertEqual(response.json(), expected_response)

    def test_hardware_limit_returned_orders(self):
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
        hardware.categories.add(self.category_limit_10.pk)

        order = Order.objects.create(team=self.user.profile.team, status="Picked Up")
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
        self.assertCountEqual(order.hardware_set.all(), [hardware])

    def test_hardware_limit_cancelled_orders(self):
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
        hardware.categories.add(self.category_limit_10.pk)

        order = Order.objects.create(team=self.user.profile.team, status="Cancelled")
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
        self.assertCountEqual(order.hardware_set.all(), [hardware])

    def test_invalid_input_category_limit(self):
        self._login()
        profile = self._make_event_profile()
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
                "Category {} limit reached".format(self.category_limit_1.name)
            ]
        }
        self.assertEqual(response.json(), expected_response)

    def test_invalid_input_category_limit_past_orders(self):
        self._login()
        profile = self._make_event_profile()
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

        expected_response = {
            "non_field_errors": [
                "Category {} limit reached".format(self.category_limit_4.name)
            ]
        }
        self.assertEqual(response.json(), expected_response)

    def test_category_limit_returned_orders(self):
        self._login()
        profile = self._make_event_profile()
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

        order = Order.objects.create(team=self.user.profile.team, status="Picked Up")
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
        self.assertCountEqual(order.hardware_set.all(), [hardware])

    def test_category_limit_cancelled_orders(self):
        self._login()
        profile = self._make_event_profile()
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

        order = Order.objects.create(team=self.user.profile.team, status="Cancelled")
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
        self.assertCountEqual(order.hardware_set.all(), [hardware])

    def test_invalid_inputs_multiple_hardware(self):
        self._login()
        profile = self._make_event_profile()

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
            "Category {} limit reached".format(self.category_limit_1.name),
            "Hardware {} limit reached".format(limited_hardware.name),
        ]
        self.assertCountEqual(
            response.json().get("non_field_errors"), expected_error_messages
        )

    def test_multiple_hardware_success(self):
        self._login()
        profile = self._make_event_profile()

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
        self.assertCountEqual(order.hardware_set.all(), [hardware_1, hardware_2])
        self.assertEqual(
            order.items.filter(hardware=hardware_1).count(), num_hardware_1_requested
        )
        self.assertEqual(
            order.items.filter(hardware=hardware_2).count(), num_hardware_2_requested
        )

    def test_repeated_hardware_input_ids(self):
        self._login()
        profile = self._make_event_profile()

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
        self.assertCountEqual(order.hardware_set.all(), [hardware])

    def test_limited_by_remaining_quantities(self):
        # we won't test the other contributing causes for "remaining quantities"
        # because they should be covered by the tests for remaining quantity field
        self._login()
        profile = self._make_event_profile()

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
        num_expected_fulfilled = 3

        order = Order.objects.create(team=self.user.profile.team, status="Submitted")
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

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": 2,
            "hardware": [
                {
                    "hardware_id": hardware.id,
                    "quantity_fulfilled": num_expected_fulfilled,
                }
            ],
            "errors": [
                {
                    "hardware_id": hardware.id,
                    "message": "Only {} of {} {}(s) were available".format(
                        num_expected_fulfilled, num_hardware_requested, hardware.name,
                    ),
                }
            ],
        }
        self.assertEqual(response.json(), expected_response)

        order = Order.objects.get(pk=2)
        self.assertCountEqual(order.hardware_set.all(), [hardware])
        self.assertEqual(
            order.items.filter(hardware=hardware).count(), num_expected_fulfilled
        )

    def test_empty_input(self):
        self._login()
        profile = self._make_event_profile()
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

    def test_no_remaining_quantities(self):
        self._login()
        profile = self._make_event_profile()
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

        order = Order.objects.create(team=self.user.profile.team, status="Submitted")
        order_item = OrderItem.objects.create(order=order, hardware=hardware)

        request_data = {"hardware": [{"id": hardware.id, "quantity": 1}]}
        response = self.client.post(self.view, request_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        expected_response = {
            "order_id": None,
            "hardware": [{"hardware_id": hardware.id, "quantity_fulfilled": 0,}],
            "errors": [
                {
                    "hardware_id": hardware.id,
                    "message": "There are no {}s available".format(hardware.name),
                }
            ],
        }
        self.assertEqual(response.json(), expected_response)
