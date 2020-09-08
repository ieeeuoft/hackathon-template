from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.forms import ApplicationForm


class SignUpViewTestCase(SetupUserMixin, TestCase):
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
            "email": "testuser@email.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
        }
        response = self.client.post(self.view, data)
        self.assertRedirects(response, reverse("registration:signup_complete"))
        redirected_response = response.client.get(response.url)
        self.assertContains(redirected_response, "Activate your account")

    def test_redirects_user_to_dashboard_if_authenticated(self):
        self._login()
        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))


class ActivationViewTestCase(TestCase):
    """
    Test the activation view. This is nearly identical to django_registration's
    ActivationView, we just add the contact email into the template context.
    Hence, that's the only thing we test for.
    """

    def setUp(self):
        super().setUp()
        self.view = reverse(
            "registration:activate", kwargs={"activation_key": "i-am-fake"}
        )

    def test_error_page_has_contact_email(self):
        response = self.client.get(self.view)
        self.assertContains(response, settings.CONTACT_EMAIL)


class ApplicationViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.view = reverse("registration:application")

    def test_requires_login(self):
        response = self.client.get(self.view)
        self.assertRedirects(response, f"{reverse('event:login')}?next={self.view}")

    def test_displays_errors(self):
        """
        Test that the template displays errors. All fields are rendered the same.
        """
        self._login()
        form = ApplicationForm()
        num_required_fields = len(
            [field for field in form.fields.values() if field.required]
        )

        response = self.client.post(self.view, {})
        self.assertContains(response, "This field is required", num_required_fields)


class MiscRegistrationViewsTestCase(TestCase):
    """
    Tests for the straggler registration views, that are just
    defined in the urlconf with TemplateViews.
    """

    def test_signup_complete(self):
        response = self.client.get(reverse("registration:signup_complete"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Test that the default from email was passed in as a context variable
        self.assertContains(response, settings.DEFAULT_FROM_EMAIL)

    def test_signup_closed(self):
        response = self.client.get(reverse("registration:signup_closed"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Test that context variables were passed in
        self.assertContains(response, settings.HACKATHON_NAME)
        self.assertContains(response, settings.CONTACT_EMAIL)
        self.assertContains(
            response, settings.REGISTRATION_CLOSE_DATE.strftime("%B %-d, %Y")
        )
