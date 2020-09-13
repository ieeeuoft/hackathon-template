from datetime import date

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.forms import ApplicationForm
from registration.models import Application, Team, User


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

    def test_redirects_get_if_has_application(self):
        Application.objects.create(user=self.user, team=self.team, **self.data)
        self._login()
        response = self.client.get(self.view)
        self.assertRedirects(response, reverse("event:dashboard"))

    def test_redirects_post_if_has_application(self):
        Application.objects.create(user=self.user, team=self.team, **self.data)
        self._login()
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

    def test_signup_closed(self):
        response = self.client.get(reverse("registration:signup_closed"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Test that context variables were passed in
        self.assertContains(response, settings.HACKATHON_NAME)
        self.assertContains(response, settings.CONTACT_EMAIL)
        self.assertContains(
            response, settings.REGISTRATION_CLOSE_DATE.strftime("%B %-d, %Y")
        )


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

    @override_settings(REGISTRATION_OPEN=False)
    def test_registration_has_closed(self):
        self._login()
        response = self.client.get(self.view)
        self.assertContains(
            response,
            "You cannot change teams after registration has closed.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
