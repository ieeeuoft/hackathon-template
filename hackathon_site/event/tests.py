import re
from unittest.mock import patch
from datetime import datetime, timedelta

from django.conf import settings
from django.core import mail
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

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
        profile = Profile.objects.create(user=self.user, team=team)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(profile.team, team)

    def test_creates_team_if_not_provided(self):
        profile = Profile.objects.create(user=self.user)
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

    @patch("event.views.is_registration_open")
    def test_links_to_dashboard_when_not_applied_and_registration_closed(
        self, mock_is_registration_open
    ):
        mock_is_registration_open.return_value = False
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

    @patch("event.views.is_registration_open")
    def test_no_apply_button_when_registration_closed(self, mock_is_registration_open):
        mock_is_registration_open.return_value = False
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
        self.assertContains(response, "Application Incomplete")
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
        self.assertContains(response, "Application Complete")

        # Leave team link appears
        self.assertContains(response, "Leave team")
        self.assertContains(response, reverse("registration:leave-team"))

        # Team code appears
        self.assertContains(response, self.user.application.team.team_code)

        # Join team form appears
        self.assertContains(response, "Join a different team")

    def test_dashboard_when_application_reviewed_but_decision_not_sent(self):
        """
        Test the dashboard after the user's application has been reviewed but a decision
        has not been sent to the user yet. The user's dashboard should display the same
        as when they have just completed their application
        """
        self._login()
        self._apply()
        self._review(decision_sent_date=None)

        response = self.client.get(self.view)
        self.assertNotContains(response, reverse("registration:application"))
        self.assertNotContains(
            response, "You must complete your application before you can form a team"
        )
        self.assertContains(response, "Application Complete")

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_when_accepted_waiting_for_rsvp(self):
        """
        Test the dashboard when the user has been accepted and the IEEE team is waiting
        for their RSVP.
        """
        self._login()
        self._apply()
        self._review()
        response = self.client.get(self.view)

        self.assertContains(response, "Accepted, awaiting RSVP")
        self.assertContains(
            response, f"You've been accepted into {settings.HACKATHON_NAME}!"
        )

        # Buttons for RSVP appear
        self.assertContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_when_waitlisted(self):
        """
        Test the dashboard when user has been waitlisted
        """
        self._login()
        self._apply()
        self._review(status="Waitlisted")
        response = self.client.get(self.view)

        self.assertContains(response, "Waitlisted")
        self.assertContains(
            response, f"You've been waitlisted for {settings.HACKATHON_NAME}"
        )
        # Buttons for RSVP don't appear
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_when_rejected(self):
        """
        Test the dashboard when user has been rejected
        """
        self._login()
        self._apply()
        self._review(status="Rejected")
        response = self.client.get(self.view)

        self.assertContains(response, "Rejected")
        self.assertContains(
            response, f"You've been rejected from {settings.HACKATHON_NAME}"
        )

        # Buttons for RSVP don't appear
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_rsvp_offer_accepted_and_before_rsvp_deadline(self):
        """
        Test the dashboard when user has RSVPed yes and they are still within the RSVP deadline
        """
        self._login()
        self._apply()
        self._review()
        self.user.application.rsvp = True
        self.user.application.save()
        self.user.application.refresh_from_db()

        response = self.client.get(self.view)

        self.assertContains(response, "Will Attend (Accepted)")
        self.assertContains(response, f"See you at {settings.HACKATHON_NAME}!")
        self.assertContains(response, f"{settings.CHAT_ROOM[0]}")
        self.assertContains(response, f"{settings.CHAT_ROOM[1]}")

        # Button to decline still appears and button to accept is gone
        self.assertContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_rsvp_offer_declined_and_before_rsvp_deadline(self):
        """
        Test the dashboard when user has RSVPed no and they are still within the RSVP deadline
        """
        self._login()
        self._apply()
        self._review()
        self.user.application.rsvp = False
        self.user.application.save()
        self.user.application.refresh_from_db()

        response = self.client.get(self.view)

        self.assertContains(response, "Cannot Attend (Declined)")
        self.assertContains(
            response, f"Hope to see you next year at {settings.HACKATHON_NAME}"
        )

        # Button to accept still appears and button to decline is gone
        self.assertContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_rsvp_offer_accepted_and_rsvp_deadline_passed(self):
        """
        Test the dashboard when user has RSVPed yes and the RSVP deadline has passed
        """
        self._login()
        self._apply()
        decision_sent_date = datetime.now().replace(
            tzinfo=settings.TZ_INFO
        ) - timedelta(days=settings.RSVP_DAYS + 1)

        self._review(decision_sent_date=decision_sent_date)
        self.user.application.rsvp = True
        self.user.application.save()
        self.user.application.refresh_from_db()

        response = self.client.get(self.view)

        self.assertContains(
            response,
            f"Thanks for confirming your position at {settings.HACKATHON_NAME}! We look forward to seeing you there.",
        )
        self.assertContains(
            response, "Note that you cannot change your RSVP at this time."
        )
        self.assertContains(response, "The RSVP deadline has passed.")

        # Buttons for RSVP don't appear anymore because rsvp deadline passed
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_rsvp_offer_declined_and_rsvp_deadline_passed(self):
        """
        Test the dashboard when user has RSVPed no and the RSVP deadline has passed
        """
        self._login()
        self._apply()
        decision_sent_date = datetime.now().replace(
            tzinfo=settings.TZ_INFO
        ) - timedelta(days=settings.RSVP_DAYS + 1)

        self._review(decision_sent_date=decision_sent_date)
        self.user.application.rsvp = False
        self.user.application.save()
        self.user.application.refresh_from_db()

        response = self.client.get(self.view)

        self.assertContains(
            response,
            f"We regret to see that you will not be joining us this year at {settings.HACKATHON_NAME}.",
        )
        self.assertContains(
            response, "Unfortunately you cannot change your RSVP at this time."
        )
        self.assertContains(response, "The RSVP deadline has passed.")

        # Buttons for RSVP don't appear anymore because rsvp deadline passed
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    def test_dashboard_no_rsvp_and_rsvp_deadline_passed(self):
        """
        Test the dashboard when user has not given an RSVP and the RSVP deadline has passed
        """
        self._login()
        self._apply()
        decision_sent_date = datetime.now().replace(
            tzinfo=settings.TZ_INFO
        ) - timedelta(days=settings.RSVP_DAYS + 1)

        self._review(decision_sent_date=decision_sent_date)

        response = self.client.get(self.view)

        self.assertContains(response, "It appears you haven't RSVPed.")
        self.assertContains(
            response,
            "Unfortunately the RSVP deadline has passed and you cannot change your RSVP at this time.",
        )

        # Buttons for RSVP don't appear anymore because rsvp deadline passed
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        )
        self.assertNotContains(
            response, reverse("registration:rsvp", kwargs={"rsvp": "no"})
        )

        # Can't join teams anymore because reviewed
        self.assertNotContains(response, "Join a different team")

    @patch("event.views.is_registration_open")
    def test_when_not_applied_and_applications_closed(self, mock_is_registration_open):
        mock_is_registration_open.return_value = False
        self._login()
        response = self.client.get(self.view)
        self.assertContains(response, "Applications have closed")
        self.assertNotContains(response, "Complete your application")
        self.assertNotContains(response, "Apply as a team")

    @patch("event.views.is_registration_open")
    def test_shows_submitted_application_after_applications_closed(
        self, mock_is_registration_open
    ):
        mock_is_registration_open.return_value = False
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
        self.assertRedirects(response, settings.LOGOUT_REDIRECT_URL)


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
