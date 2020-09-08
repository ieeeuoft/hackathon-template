from django.conf import settings
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.core import mail
import re

from event.models import Profile, Team, User
from hackathon_site.tests import SetupUserMixin


class ProfileTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password="foobar123",
            first_name="Foo",
            last_name="Bar",
        )

    def test_creates_profile_with_provided_team(self):
        team = Team.objects.create()
        profile = Profile.objects.create(user=self.user, team=team, status="Accepted")
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(profile.team, team)

    def test_creates_team_if_not_provided(self):
        profile = Profile.objects.create(user=self.user, status="Accepted")
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.first(), profile.team)


class IndexViewTestCase(SetupUserMixin, TestCase):
    """
    Tests for the landing page template.

    We test for correct rendering and rendering of Logout/Login buttons
    """

    def setUp(self):
        super().setUp()
        self.view = reverse("event:index")

    def test_index_view(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Login")

    def test_logout_button_renders_when_logged_in(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Logout")


class LogInViewTestCase(SetupUserMixin, TestCase):
    """
    Tests for the login template.

    This view uses django.contrib.auth.forms.AuthenticationForm, so no direct
    form testing is required.

    Ideally, selenium should be used for a full test of the view UI.
    For practicality reasons, tests for templates with forms are limited to
    POSTing raw data at this time.
    """

    def setUp(self):
        super().setUp()
        self.view = reverse("event:login")

    def test_login_get(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_submit_login_missing_username_and_password(self):
        response = self.client.post(self.view, {"username": "", "password": ""})
        self.assertContains(response, "This field is required", count=2)

    def test_submit_login_invalid_credentials(self):
        response = self.client.post(
            self.view, {"username": "fake@email.com", "password": "abc123"}
        )
        self.assertContains(response, "Please enter a correct username and password")

    def test_submit_login_valid_credentials(self):
        response = self.client.post(
            self.view, {"username": self.user.username, "password": self.password}
        )
        self.assertEqual(response.url, settings.LOGIN_REDIRECT_URL)


class DashboardTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.view = reverse("event:dashboard")

    def test_redirects_to_login(self):
        """
        Redirects to the login page when not logged in
        """
        response = self.client.get(self.view)
        self.assertRedirects(response, f"{reverse('event:login')}?next={self.view}")

    def test_renders_when_logged_in(self):
        """
        Renders the dashboard when logged in

        Once the dashboard is fully implemented, this test should
        be complemented with a whole suite of tests depending on
        the user's progress through the application, etc.
        """
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Dashboard")


class LogOutViewTestCase(SetupUserMixin, TestCase):
    """
    Tests for the logout template. We simply redirect to the homepage.

    This view uses django.contrib.auth.views.LogoutView, so no logic testing
    is required.
    """

    def setUp(self):
        super().setUp()
        self.view = reverse("event:logout")
        self._login()

    def test_logout_get(self):
        response = self.client.get(self.view)
        self.assertRedirects(response, "/")


class PasswordChangeTestCase(SetupUserMixin, TestCase):
    """
    Tests for the password change template if already logged in.

    This view uses django.contrib.auth.views.PasswordChangeView and
    django.contrib.auth.views.PasswordChangeDoneView so no logic testing
    is required.
    """

    def setUp(self):
        super().setUp()
        self.view = reverse("event:change_password")
        self._login()

    def test_change_password_get(self):
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_valid_submit_redirect(self):
        data = {
            "old_password": self.password,
            "new_password1": "abcdef456",
            "new_password2": "abcdef456",
        }
        response = self.client.post(self.view, data)
        self.assertRedirects(response, reverse("event:change_password_done"))
        redirected_response = response.client.get(response.url)
        self.assertContains(
            redirected_response, "Your password was changed successfully"
        )


class PasswordResetTestCase(SetupUserMixin, TestCase):
    """
    Tests for the password reset template (reset password without login).

    This view uses django.contrib.auth.views.PasswordResetView,
    django.contrib.auth.views.PasswordResetDoneView,
    django.contrib.auth.views.PasswordResetConfirmView, and
    django.contrib.auth.views.PasswordResetCompleteView, so no logic testing
    is required.
    """

    def setUp(self):
        super().setUp()
        self.view_request_reset = reverse("event:reset_password")
        # self.view_reset = reverse("event:reset_password_confirm")

    def test_reset_password_get(self):
        response = self.client.get(self.view_request_reset)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_reset_password_valid_submit_redirect(self):
        data = {"email": self.user.email}
        response = self.client.post(self.view_request_reset, data)
        self.assertRedirects(response, reverse("event:reset_password_done"))
        redirected_response = response.client.get(response.url)
        self.assertContains(redirected_response, "Password reset sent")

        self.assertIn(settings.HACKATHON_NAME, mail.outbox[0].subject)

    def test_reset_password_confirm_get(self):
        data = {"email": self.user.email}
        self.client.post(self.view_request_reset, data)

        clean = re.compile('<.*?>')
        clean_mail_body = re.sub(clean, '', mail.outbox[0].body)

        reset_link = [
            line
            for line in clean_mail_body.split("\n")
            if "http://testserver/" in line
        ][0]

        uid_hash = reset_link.split("/")[-2]

        response = self.client.get(reset_link)
        self.assertRedirects(
            response,
            reverse("event:reset_password_confirm", args=[uid_hash, "set-password"]),
        )
        redirected_response = response.client.get(response.url)
        self.assertContains(redirected_response, "Reset Password")

    def test_reset_password_confirm_valid_submit_redirect(self):
        user_data = {"email": self.user.email}
        self.client.post(self.view_request_reset, user_data)

        clean = re.compile('<.*?>')
        clean_mail_body = re.sub(clean, '', mail.outbox[0].body)

        reset_link = [
            line
            for line in clean_mail_body.split("\n")
            if "http://testserver/" in line
        ][0]

        response = self.client.get(reset_link)
        response.client.get(response.url)
        new_password_data = {"new_password1": "abcdabcd", "new_password2": "abcdabcd"}

        submitted_response = self.client.post(response.url, new_password_data)

        self.assertRedirects(
            submitted_response, reverse("event:reset_password_complete")
        )
        redirected_response = self.client.get(submitted_response.url)
        self.assertContains(
            redirected_response, "Your password has been successfully reset"
        )
