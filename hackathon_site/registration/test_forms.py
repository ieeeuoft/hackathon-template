from django.test import TestCase
from django_registration import validators

from registration.forms import User, SignUpForm


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
