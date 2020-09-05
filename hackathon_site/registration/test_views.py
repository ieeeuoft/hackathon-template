from django.test import TestCase
from django.urls import reverse
from rest_framework import status


class SignUpViewTestCase(TestCase):
    """
    Tests for the sign up view

    As with other templates, ideally this test would be performed with
    Selenium. Instead, for simplicity, tests are limited to making sure
    the templates render correctly.
    """

    def setUp(self):
        super().setUp()
        self.view = reverse("registration:signup")

    def test_signup_get(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_displays_errors(self):
        """
        Test that the template displays field errors

        All field errors are rendered the same, so using the field
        missing error is the simplest
        """
        response = self.client.post(self.view, {})
        self.assertContains(response, "This field is required", count=5)

    def test_valid_submit_redirect(self):
        data = {
            "email": "foo@bar.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
        }
        response = self.client.post(self.view, data)
        self.assertEqual(
            response.url, "/"
        )  # This will fail until that view is implemented
