from django.conf import settings
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from django.core import mail
import re

from event.models import Profile, Team, User
from hackathon_site.tests import SetupUserMixin
from registration.models import Team as RegistrationTeam


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
        self.assertContains(response, "Apply")
        self.assertContains(response, reverse("registration:signup"))

    def test_logout_button_renders_when_logged_in(self):
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Logout")

    def test_links_to_application_when_not_applied_and_registration_open(self):
        self._login()
        response = self.client.get(self.view)
        self.assertContains(response, "Continue Application")
        self.assertContains(response, reverse("registration:application"))

    @override_settings(REGISTRATION_OPEN=False)
    def test_links_to_dashboard_when_not_applied_and_registration_closed(self):
        self._login()
        response = self.client.get(self.view)
        self.assertContains(response, "Go to Dashboard")
        self.assertContains(response, reverse("event:dashboard"))

    def test_links_to_dashboard_when_applied(self):
        self._login()
        self._apply()
        response = self.client.get(self.view)
        self.assertContains(response, "Go to Dashboard")
        self.assertContains(response, reverse("event:dashboard"))

    @override_settings(REGISTRATION_OPEN=False)
    def test_no_apply_button_when_registration_closed(self):
        response = self.client.get(self.view)
        self.assertNotContains(response, reverse("registration:signup"))


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

    def test_dashboard_when_not_applied(self):
        """
        Test the dashboard when the user has not applied

        It should:
        - Link to the application page
        - Have a note about applying before forming a team
        """
        self._login()
        response = self.client.get(self.view)
        self.assertContains(response, "Complete your application")
        self.assertContains(response, reverse("registration:application"))
        self.assertContains(
            response, "You must complete your application before you can form a team"
        )

    def test_dashboard_when_applied(self):
        """
        Test the dashboard after the user has applied
        """
        self._login()
        self._apply()
        response = self.client.get(self.view)
        self.assertNotContains(response, reverse("registration:application"))
        self.assertNotContains(
            response, "You must complete your application before you can form a team"
        )

        # Leave team link appears
        self.assertContains(response, "Leave team")
        self.assertContains(response, reverse("registration:leave-team"))

        # Team code appears
        self.assertContains(response, self.user.application.team.team_code)

        # Join team form appears
        self.assertContains(response, "Join a different team")

    @override_settings(REGISTRATION_OPEN=False)
    def test_not_applied_applications_closed(self):
        self._login()
        response = self.client.get(self.view)
        self.assertContains(response, "Applications have closed")
        self.assertNotContains(response, "Complete your application")
        self.assertNotContains(response, "Apply as a team")

    @override_settings(REGISTRATION_OPEN=False)
    def test_shows_submitted_application_after_applications_closed(self):
        self._login()
        self._apply()
        response = self.client.get(self.view)
        self.assertContains(response, "Your application has been submitted!")
        self.assertNotContains(response, "Spots remaining on your team")

    def test_join_team(self):
        """
        Once the user has applied and before they have been reviewed, they can join
        a different team
        """
        self._login()
        self._apply()

        new_team = RegistrationTeam.objects.create()
        data = {"team_code": new_team.team_code}
        response = self.client.post(self.view, data=data)
        self.assertRedirects(response, self.view)
        redirected_response = self.client.get(response.url)
        self.assertContains(redirected_response, new_team.team_code)

    def test_join_team_shows_errors(self):
        self._login()
        self._apply()

        # This team code is longer than the max allowed, so no chance that team
        # happens to be created already
        data = {"team_code": "123456"}
        response = self.client.post(self.view, data=data)
        self.assertContains(response, "Team 123456 does not exist.")

    def test_renders_all_team_members(self):
        self._login()
        self._apply()

        user2 = User.objects.create(
            username="bob@ross.com",
            first_name="Bob",
            last_name="Ross",
            password="abcdef123",
        )
        team = self.user.application.team
        self._apply_as_user(user2, team)

        response = self.client.get(self.view)

        for member in User.objects.filter(application__team_id=team.id):
            self.assertContains(response, f"{member.first_name} {member.last_name}")

        self.assertContains(response, "Team members (2/4)")

    def test_removes_message_to_share_team_code_if_full(self):
        self._login()
        self._make_full_registration_team()

        response = self.client.get(self.view)
        self.assertContains(response, "Team members (4/4)")
        self.assertNotContains(
            response,
            "Share your team code with your teammates, or join their team instead.",
        )


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

        clean = re.compile("<.*?>")
        clean_mail_body = re.sub(clean, "", mail.outbox[0].body)

        reset_link = [
            line for line in clean_mail_body.split("\n") if "http://testserver/" in line
        ][0]

        uid_hash = reset_link.split("/")[-3]

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

        clean = re.compile("<.*?>")
        clean_mail_body = re.sub(clean, "", mail.outbox[0].body)

        reset_link = [
            line for line in clean_mail_body.split("\n") if "http://testserver/" in line
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
