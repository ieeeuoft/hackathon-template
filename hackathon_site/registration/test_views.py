import unittest
from datetime import date, datetime, timedelta
from unittest.mock import patch

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.forms import ApplicationForm
from registration.models import Application, Team, User
from registration.views import SignUpView


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
        self.assertContains(response, "This field is required", count=6)

    def test_valid_submit_redirect(self):
        data = {
            "email": "testuser@email.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
            "g-recaptcha-response": "PASSED",
        }
        response = self.client.post(self.view, data)
        self.assertRedirects(response, reverse("registration:signup_complete"))
        redirected_response = response.client.get(response.url)
        self.assertContains(redirected_response, "Activate your account")

    def test_lowercases_username(self):
        data = {
            "email": "Testuser@email.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
            "g-recaptcha-response": "PASSED",
        }
        self.client.post(self.view, data)
        self.assertTrue(
            User.objects.filter(
                username="testuser@email.com", email="testuser@email.com"
            ).exists()
        )

    def test_redirects_user_to_dashboard_if_authenticated(self):
        self._login()
        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))


class SignUpClosedViewTestCase(TestCase):
    def setUp(self):
        self.view = reverse("registration:signup_closed")

    @override_settings(
        REGISTRATION_OPEN_DATE=datetime(2020, 1, 2, tzinfo=settings.TZ_INFO)
    )
    @override_settings(
        REGISTRATION_CLOSE_DATE=datetime(2020, 1, 3, tzinfo=settings.TZ_INFO)
    )
    @patch("registration.views._now")
    def test_not_open_yet(self, mock_now):
        mock_now.return_value = datetime(2020, 1, 1, tzinfo=settings.TZ_INFO)
        response = self.client.get(self.view)
        self.assertContains(response, "Applications have not opened yet")
        self.assertContains(
            response, settings.REGISTRATION_OPEN_DATE.strftime("%B %-d, %Y")
        )

    @override_settings(
        REGISTRATION_OPEN_DATE=datetime(2020, 1, 1, tzinfo=settings.TZ_INFO)
    )
    @override_settings(
        REGISTRATION_CLOSE_DATE=datetime(2020, 1, 3, tzinfo=settings.TZ_INFO)
    )
    @patch("registration.views._now")
    def test_registration_open(self, mock_now):
        mock_now.return_value = datetime(2020, 1, 2, tzinfo=settings.TZ_INFO)
        response = self.client.get(self.view)
        self.assertContains(response, "Applications are open!")
        self.assertContains(response, reverse("registration:signup"))

    @override_settings(
        REGISTRATION_OPEN_DATE=datetime(2020, 1, 1, tzinfo=settings.TZ_INFO)
    )
    @override_settings(
        REGISTRATION_CLOSE_DATE=datetime(2020, 1, 2, tzinfo=settings.TZ_INFO)
    )
    @patch("registration.views._now")
    def test_closed(self, mock_now):
        mock_now.return_value = datetime(2020, 1, 3, tzinfo=settings.TZ_INFO)
        response = self.client.get(self.view)
        self.assertContains(response, "Applications have closed")
        self.assertContains(
            response, settings.REGISTRATION_CLOSE_DATE.strftime("%B %-d, %Y")
        )


class ActivationViewTestCase(SetupUserMixin, TestCase):
    """
    Test the activation view
    """

    def setUp(self):
        super().setUp()
        self.view_name = "registration:activate"

        self.activation_key = SignUpView().get_activation_key(self.user)

    def _build_view(self, activation_key):
        return reverse(self.view_name, kwargs={"activation_key": activation_key})

    def test_invalid_key(self):
        response = self.client.get(self._build_view("i-am-fake"))
        self.assertContains(response, "Activation link is invalid")
        self.assertContains(response, settings.CONTACT_EMAIL)

    def test_account_already_activated(self):
        self.user.is_active = True
        self.user.save()
        response = self.client.get(self._build_view(self.activation_key))
        self.assertContains(response, "Account already activated")
        self.assertContains(response, reverse("event:login"))
        self.assertNotContains(response, settings.CONTACT_EMAIL)

    @override_settings(ACCOUNT_ACTIVATION_DAYS=0)
    def test_activation_link_expired(self):
        response = self.client.get(self._build_view(self.activation_key))
        self.assertContains(response, "Activation link has expired")
        self.assertContains(response, settings.CONTACT_EMAIL)

    def test_successful_activation(self):
        self.user.is_active = False
        self.user.save()
        activation_key = SignUpView().get_activation_key(self.user)
        response = self.client.get(self._build_view(activation_key))
        self.assertRedirects(response, reverse("event:login"))


class ApplicationViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.view = reverse("registration:application")

        self.data = {
            "birthday": date(2020, 9, 8),
            "gender": "male",
            "ethnicity": "caucasian",
            "phone_number": "2262208655",
            "school": "UofT",
            "study_level": "other",
            "graduation_year": 2020,
            "q1": "hi",
            "q2": "there",
            "q3": "foo",
            "conduct_agree": True,
            "data_agree": True,
            "resume": "uploads/resumes/my_resume.pdf",
        }

        self.team = Team.objects.create()

        self.post_data = self.data.copy()
        self.post_data["birthday"] = "2000-01-01"  # The format used by the widget
        self.post_data["resume"] = SimpleUploadedFile(
            "my_resume.pdf", b"some content", content_type="application/pdf"
        )

    def test_requires_login(self):
        response = self.client.get(self.view)
        self.assertRedirects(response, f"{reverse('event:login')}?next={self.view}")

    def test_displays_errors(self):
        """
        Test that the template displays errors. All fields are rendered the same.
        """
        self._login()
        form = ApplicationForm(user=self.user)
        num_required_fields = len(
            [field for field in form.fields.values() if field.required]
        )

        response = self.client.post(self.view, {})
        self.assertContains(response, "This field is required", num_required_fields)

    def test_creates_application(self):
        self._login()
        response = self.client.post(self.view, data=self.post_data)
        self.assertRedirects(response, reverse("event:dashboard"))
        self.assertEqual(Application.objects.count(), 1)
        self.assertEqual(Application.objects.first().user, self.user)

    def test_redirects_if_has_application(self):
        Application.objects.create(user=self.user, team=self.team, **self.data)
        self._login()
        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))
        response = self.client.post(self.view, data=self.post_data)
        self.assertRedirects(response, reverse("event:dashboard"))

    @patch("registration.views.is_registration_open")
    def test_redirects_if_registration_closed(self, mock_is_registration_open):
        mock_is_registration_open.return_value = False
        self._login()
        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))
        response = self.client.post(self.view, data=self.post_data)
        self.assertRedirects(response, reverse("event:dashboard"))


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


class LeaveTeamViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()

        self.view = reverse("registration:leave-team")

    def test_requires_login(self):
        response = self.client.get(self.view)
        self.assertRedirects(response, f"{reverse('event:login')}?next={self.view}")

    def test_bad_response_for_no_application(self):
        self._login()
        response = self.client.get(self.view)
        self.assertContains(
            response,
            "You have not submitted an application.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def test_leaves_and_deletes_empty_team(self):
        self._login()
        self._apply()
        initial_team_id = self.user.application.team.id

        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))
        self.user.application.refresh_from_db()
        self.assertNotEqual(self.user.application.team.id, initial_team_id)
        self.assertEqual(Team.objects.count(), 1)

    def test_leaves_and_does_not_delete_nonempty_team(self):
        self._login()
        application = self._apply()
        new_user = User.objects.create_user(
            username="bob@ross.com", password="hithere987"
        )
        self._apply_as_user(new_user, team=application.team)

        initial_team_id = self.user.application.team.id

        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))
        self.user.application.refresh_from_db()
        self.assertNotEqual(self.user.application.team.id, initial_team_id)
        self.assertEqual(Team.objects.count(), 2)

    @patch("registration.views.is_registration_open")
    def test_registration_has_closed(self, mock_is_registration_open):
        mock_is_registration_open.return_value = False
        self._login()
        response = self.client.get(self.view)
        self.assertContains(
            response,
            "You cannot change teams after registration has closed.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@unittest.skipIf(not settings.RSVP, "Not using RSVP")
class RSVPViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.view_accept = reverse("registration:rsvp", kwargs={"rsvp": "yes"})
        self.view_decline = reverse("registration:rsvp", kwargs={"rsvp": "no"})

    def test_bad_response_for_no_application(self):
        self._login()
        response = self.client.get(self.view_accept)
        self.assertContains(
            response,
            "You have not submitted an application.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def test_bad_response_for_not_reviewed(self):
        self._login()
        self._apply()
        response = self.client.get(self.view_accept)
        self.assertContains(
            response,
            "Your application has not yet been reviewed.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def test_bad_response_for_not_accepted(self):
        self._login()
        self._apply()
        self._review(status="Waitlisted")
        response = self.client.get(self.view_accept)
        self.assertContains(
            response,
            "You cannot RSVP since your application has not yet been accepted.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    def test_decline_no_profile_and_redirects(self):
        self._login()
        self._apply()
        self._review()

        response = self.client.get(self.view_decline)
        self.user.application.refresh_from_db()

        self.assertFalse(self.user.application.rsvp)
        self.assertFalse(hasattr(self.user, "profile"))
        self.assertRedirects(response, reverse("event:dashboard"))

    def test_accept_create_profile_and_redirects(self):
        self._login()
        self._apply()
        self._review()

        response = self.client.get(self.view_accept)
        self.user.application.refresh_from_db()

        self.assertTrue(self.user.application.rsvp)
        self.assertTrue(hasattr(self.user, "profile"))
        self.assertRedirects(response, reverse("event:dashboard"))

    def test_redirects_to_dashboard_if_rsvp_deadline_passed(self):
        self._login()
        self._apply()
        self._review(
            decision_sent_date=datetime.now().replace(tzinfo=settings.TZ_INFO).date()
            - timedelta(days=settings.RSVP_DAYS + 1)
        )

        response = self.client.get(self.view_accept)
        self.user.application.refresh_from_db()

        self.assertIsNone(self.user.application.rsvp)
        self.assertRedirects(response, reverse("event:dashboard"))
