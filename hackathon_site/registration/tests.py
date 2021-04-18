from django.test import TestCase
from unittest.mock import MagicMock

from registration.views import SignUpView


class CustomSignUpViewTestCase(TestCase):
    """
    Tests the aspects of ``registration.views.SignUpView`` which relate to
    class behaviour, and not to to rendering templates.
    """

    def test_sends_email_html_body_template(self):
        """
        When both ``email_body_template`` and ``html_body_template`` are defined,
        an email should be sent with the former as the plaintext alternative and
        the latter as the html alternative.
        """

        class SignUpViewWithHTMLEmailTemplate(SignUpView):
            email_body_template = (
                "registration/test_emails/test_activation_email_body.txt"
            )
            html_email_body_template = (
                "registration/test_emails/test_activation_email_body.html"
            )
            email_subject_template = (
                "registration/test_emails/test_activation_email_subject.txt"
            )

            request = MagicMock()

        user = MagicMock()
        user.get_username.return_value = "username"
        view = SignUpViewWithHTMLEmailTemplate()

        view.send_activation_email(user)

        user.email_user.assert_called()

        subject, plain_message, _ = user.email_user.call_args[0]
        html_message = user.email_user.call_args[1]["html_message"]

        # Test that the subject had the newline removed
        self.assertEqual(len(subject.splitlines()), 1)

        # Test that the plaintext email is not the same as the html email
        self.assertNotEqual(plain_message, html_message)
        self.assertIn("<p>", html_message)

    def test_sends_single_email_template_as_html(self):
        """
        When only ``email_body_template`` is set, it should be used as the
        plaintext and html message alternatives.
        """

        class SignUpViewWithSingleEmailTemplate(SignUpView):
            email_body_template = (
                "registration/test_emails/test_activation_email_body.txt"
            )
            email_subject_template = (
                "registration/test_emails/test_activation_email_subject.txt"
            )

            request = MagicMock()

        user = MagicMock()
        user.get_username.return_value = "username"
        view = SignUpViewWithSingleEmailTemplate()

        view.send_activation_email(user)

        user.email_user.assert_called()

        subject, plain_message, _ = user.email_user.call_args[0]
        html_message = user.email_user.call_args[1]["html_message"]

        # Test that the plaintext email is the same as the html email
        self.assertEqual(plain_message, html_message)
