from datetime import date

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django_registration import validators

from hackathon_site.tests import SetupUserMixin
from registration.models import User, Team, Application
from registration.forms import SignUpForm, ApplicationForm


class SignUpFormTestCase(TestCase):
    def test_fields_required(self):
        form = SignUpForm()
        for field in (
            User.get_email_field_name(),
            "first_name",
            "last_name",
            "password1",
            "password2",
        ):
            self.assertTrue(form.fields[field].required)

    def test_has_email_validators(self):
        """
        Test that the necessary validators for email have been added.
        """
        form = SignUpForm()
        email_validators = form.fields["email"].validators
        self.assertTrue(
            any(isinstance(v, validators.HTML5EmailValidator) for v in email_validators)
        )
        self.assertTrue(validators.validate_confusables_email in email_validators)
        self.assertTrue(
            any(
                isinstance(v, validators.CaseInsensitiveUnique)
                for v in email_validators
            )
        )

    def test_email_uniqueness(self):
        """
        Test that the case insensitive validator for email was configured correctly
        """
        User.objects.create_user(
            username="foo@bar.com", email="foo@bar.com", password="foobar123"
        )
        data = {
            "email": "FOO@bar.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
        }

        form = SignUpForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn("This email is unavailable", form.errors["email"])

    def test_sets_username_to_email(self):
        data = {
            "email": "foo@bar.com",
            "first_name": "Foo",
            "last_name": "Bar",
            "password1": "abcdef456",
            "password2": "abcdef456",
        }
        form = SignUpForm(data=data)
        self.assertTrue(form.is_valid())
        user = form.save()
        self.assertEqual(user, User.objects.first())
        self.assertEqual(user.username, user.email)
        self.assertEqual(user.email, data["email"])


class ApplicationFormTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
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
        }
        self.files = {
            "resume": SimpleUploadedFile(
                "my_resume.pdf", b"some content", content_type="application/pdf"
            )
        }

    def test_fields_are_required(self):
        for field in self.data:
            bad_data = self.data.copy()
            del bad_data[field]

            form = ApplicationForm(user=self.user, data=bad_data, files=self.files)
            self.assertFalse(form.is_valid())
            self.assertIn(field, form.errors, msg=field)
            self.assertIn("This field is required.", form.errors[field], msg=field)

        # File field
        form = ApplicationForm(user=self.user, data=self.data, files={})
        self.assertFalse(form.is_valid())
        self.assertIn("resume", form.errors)
        self.assertIn("This field is required.", form.errors["resume"])

    def test_user_already_has_application(self):
        team = Team.objects.create()
        Application.objects.create(
            user=self.user, team=team, resume="resume.pdf", **self.data
        )

        form = ApplicationForm(user=self.user, data=self.data, files=self.files)
        self.assertFalse(form.is_valid())
        self.assertIn(
            "User has already submitted an application", form.non_field_errors()
        )

    def test_saving_adds_team_and_user(self):
        form = ApplicationForm(user=self.user, data=self.data, files=self.files)
        self.assertTrue(form.is_valid())
        instance = form.save()

        self.assertEqual(Application.objects.count(), 1)
        self.assertEqual(Application.objects.first(), instance)
        self.assertEqual(Team.objects.count(), 1)
        self.assertEqual(Team.objects.first(), instance.team)
        self.assertEqual(instance.user, self.user)

    def test_does_not_save_when_commit_false(self):
        form = ApplicationForm(user=self.user, data=self.data, files=self.files)
        form.save(commit=False)

        self.assertEqual(Team.objects.count(), 1)  # Team still gets created for the FK
        self.assertEqual(Application.objects.count(), 0)

