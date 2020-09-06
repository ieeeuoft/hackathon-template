from django.conf import settings
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django_registration.backends.activation.views import (
    RegistrationView,
    ActivationView as _ActivationView,
)

from registration.forms import SignUpForm


class SignUpView(RegistrationView):
    template_name = "registration/signup.html"
    form_class = SignUpForm
    email_subject_template = "registration/emails/activation_email_subject.txt"
    email_body_template = "registration/emails/activation_email_body.html"
    success_url = reverse_lazy("registration:signup_complete")

    def get_email_context(self, activation_key):
        context = super().get_email_context(activation_key)
        context["hackathon_name"] = settings.HACKATHON_NAME
        return context

    def send_activation_email(self, user):
        """
        Send the activation email. The activation key is the username,
        signed using TimestampSigner.

        This function is nearly identical to django_registration's
        ``send_activation_email``. However, the latter only renders messages in
        plain text.

        The view must define an ``email_body_template``. If the view also defines
        an ``html_email_body_template``, the former will be sent as a plaintext
        alternative in the message and the latter as an html alternative. If
        ``html_email_body_template`` is not set, the message will be sent with
        ``email_body_template`` as both plaintext and html alternatives.
        """

        activation_key = self.get_activation_key(user)
        context = self.get_email_context(activation_key)
        context["user"] = user
        subject = render_to_string(
            template_name=self.email_subject_template,
            context=context,
            request=self.request,
        )
        # Force subject to a single line to avoid header-injection
        # issues.
        subject = "".join(subject.splitlines())

        plain_message = render_to_string(
            template_name=self.email_body_template,
            context=context,
            request=self.request,
        )
        if hasattr(self, "html_email_body_template"):
            html_message = render_to_string(
                template_name=self.html_email_body_template,
                context=context,
                request=self.request,
            )
        else:
            html_message = plain_message

        user.email_user(
            subject,
            plain_message,
            settings.DEFAULT_FROM_EMAIL,
            html_message=html_message,
        )


class ActivationView(_ActivationView):
    success_url = reverse_lazy("event:dashboard")
    # This page only gets rendered if something went wrong, otherwise
    # the user is redirected
    template_name = "registration/activation_failed.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["email"] = settings.CONTACT_EMAIL
        return context
