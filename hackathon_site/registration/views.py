from datetime import datetime, timedelta
import mimetypes
from pathlib import Path

from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.db import transaction
from django.http import HttpResponseBadRequest, FileResponse, Http404
from django.shortcuts import redirect
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils._os import safe_join
from django.views.generic.base import View, TemplateView
from django.views.generic.edit import CreateView
from django_registration.backends.activation.views import (
    RegistrationView,
    ActivationView as _ActivationView,
)

from hackathon_site.utils import is_registration_open
from registration.forms import SignUpForm, ApplicationForm
from registration.models import Team as RegistrationTeam
from event.models import Team as EventTeam, Profile


def _now():
    return datetime.now().replace(tzinfo=settings.TZ_INFO)


class SignUpView(RegistrationView):
    template_name = "registration/signup.html"
    form_class = SignUpForm
    email_subject_template = "registration/emails/activation_email_subject.txt"
    email_body_template = "registration/emails/activation_email_body.html"
    success_url = reverse_lazy("registration:signup_complete")
    disallowed_url = reverse_lazy("registration:signup_closed")

    def registration_allowed(self):
        return is_registration_open()

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

    def get(self, request, *args, **kwargs):
        if self.request.user.is_authenticated:
            return redirect(reverse_lazy("event:dashboard"))

        return super().get(request, *args, **kwargs)


class SignUpClosedView(TemplateView):
    template_name = "registration/signup_closed.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context.update(
            {
                "registration_close_date": settings.REGISTRATION_CLOSE_DATE,
                "registration_open_date": settings.REGISTRATION_OPEN_DATE,
                "now": _now,
            }
        )
        return context


class ActivationView(_ActivationView):
    success_url = reverse_lazy("event:login")
    # This page only gets rendered if something went wrong, otherwise
    # the user is redirected
    template_name = "registration/activation_failed.html"


class ApplicationView(LoginRequiredMixin, CreateView):
    form_class = ApplicationForm
    template_name = "registration/application.html"
    success_url = reverse_lazy("event:dashboard")

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs["user"] = self.request.user
        return kwargs

    def dispatch(self, request, *args, **kwargs):
        if hasattr(request.user, "application"):
            return redirect(reverse_lazy("event:dashboard"))

        if not is_registration_open():
            return redirect(reverse_lazy("event:dashboard"))

        return super().dispatch(request, *args, **kwargs)


class LeaveTeamView(LoginRequiredMixin, View):
    """
    Visiting this page will remove a user from their team for
    registration
    """

    @transaction.atomic
    def leave_team(self, request):
        if not is_registration_open():
            return HttpResponseBadRequest(
                "You cannot change teams after registration has closed.".encode(
                    encoding="utf-8"
                )
            )

        if not hasattr(request.user, "application"):
            return HttpResponseBadRequest(
                "You have not submitted an application.".encode(encoding="utf-8")
            )

        application = self.request.user.application
        team = application.team

        # Leaving a team automatically puts them on a new team
        application.team = RegistrationTeam.objects.create()
        application.save()

        # Delete the team if it is empty
        if not team.applications.exists():
            team.delete()

        return redirect(reverse_lazy("event:dashboard"))

    def get(self, request, *args, **kwargs):
        return self.leave_team(request)

    def post(self, request, *args, **kwargs):
        return self.leave_team(request)


class ResumeView(LoginRequiredMixin, PermissionRequiredMixin, View):
    permission_required = "registration.view_application"

    def get(self, request, *args, **kwargs):
        """
        Return requested resume, if found. Requires registration.view_application
        permissions.

        This is pretty much a simplified version of Django's static file serve
        view: https://github.com/django/django/blob/stable/3.1.x/django/views/static.py#L19.

        User-uploaded files that don't require a permissions check should be served
        from a regular web server.
        """

        filepath = Path(
            safe_join(
                settings.MEDIA_ROOT, "applications", "resumes", kwargs["filename"]
            )
        )

        if not filepath.is_file():
            raise Http404()

        content_type, encoding = mimetypes.guess_type((str(filepath)))
        content_type = content_type or "application/octet-stream"

        response = FileResponse(filepath.open("rb"), content_type=content_type)
        if encoding:
            response["Content-Encoding"] = encoding

        return response


class RSVPView(LoginRequiredMixin, View):
    """
    This page checks if the RSVP deadline has passed and then does one of
    the following:
        1. If the deadline has passed, redirect to the dashboard
        2. Otherwise if their decision was a 'yes', we note that and
            create a profile for them
        3. Otherwise if their decision was a 'no', we note that and remove
            their profile and team if they had one.

    Finally we redirect to the dashboard.
    """

    def get(self, request, *args, **kwargs):
        decision = kwargs["rsvp"]

        # Check for nulls
        user = self.request.user
        if not hasattr(user, "application"):
            return HttpResponseBadRequest(
                "You have not submitted an application.".encode(encoding="utf-8")
            )

        application = user.application
        if not hasattr(application, "review"):
            return HttpResponseBadRequest(
                "Your application has not yet been reviewed.".encode(encoding="utf-8")
            )

        review = application.review
        if not review.status == "Accepted":
            return HttpResponseBadRequest(
                "You cannot RSVP since your application has not yet been accepted.".encode(
                    encoding="utf-8"
                )
            )

        # Check if RSVP deadline has passed
        if _now().date() > review.decision_sent_date + timedelta(
            days=settings.RSVP_DAYS
        ):
            return redirect(reverse_lazy("event:dashboard"))

        # Check decision
        else:
            if decision == "yes" and not application.rsvp:
                application.rsvp = True
                application.save()

                # TODO: decide whether to create profile when rsvp
                # profile = Profile(user=user, team=EventTeam.objects.create())
                # profile.save()

            elif decision == "no" and (application.rsvp or application.rsvp is None):
                application.rsvp = False
                application.save()

                # Delete the profile
                if hasattr(request.user, "profile"):
                    team = user.profile.team
                    user.profile.delete()

                    # Delete the team if it is empty
                    if not team.profiles.exists():
                        team.delete()

        return redirect(reverse_lazy("event:dashboard"))
