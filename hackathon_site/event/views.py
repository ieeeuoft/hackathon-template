from datetime import datetime, timedelta

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView


from django.conf import settings
from django_filters import rest_framework as filters

from rest_framework import generics, mixins
from rest_framework.filters import SearchFilter


from hackathon_site.utils import (
    is_registration_open,
    is_hackathon_happening,
    NoEventOccurringException,
    get_curr_sign_in_time,
)
from registration.forms import JoinTeamForm, SignInForm
from registration.models import Team as RegistrationTeam, User, Application

from event.models import Team as EventTeam, UserActivity
from event.serializers import TeamSerializer
from event.api_filters import TeamFilter
from event.permissions import FullDjangoModelPermissions


def _now():
    return datetime.now().replace(tzinfo=settings.TZ_INFO)


class IndexView(TemplateView):
    template_name = "event/landing.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # In testing, the @patch decorator doesn't run in time for the jinja2
        # environment. Set the is_registration_open context here again to make sure the
        # it is reflected in templates for testing
        context["is_registration_open"] = is_registration_open

        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)
        return context


class DashboardView(LoginRequiredMixin, FormView):
    # Form submits should take the user back to the dashboard
    success_url = reverse_lazy("event:dashboard")

    def get_template_names(self):
        if self.request.user.is_staff:
            return "event/dashboard_admin.html"
        return "event/dashboard_base.html"

    def get_form(self, form_class=None):
        """
        The dashboard can have different forms, but not at the same time:
        - When no application has been submitted, no form.
        - Once an application has been submitted and registration is open, the JoinTeamForm.
        - Once the application has been reviewed and accepted, no form, but will show buttons
            to RSVP Yes or RSVP No
        - Once the application has been reviewed and rejected, no form.
        """

        if form_class is not None:
            return form_class(**self.get_form_kwargs())

        if not hasattr(self.request.user, "application"):
            return None

        if hasattr(self.request.user.application, "review"):
            return None

        if is_registration_open():
            return JoinTeamForm(**self.get_form_kwargs())

        return None

    def form_valid(self, form):
        """
        As above, what form we're dealing with depends on the user's progress through
        the application cycle.
        """

        if isinstance(form, JoinTeamForm):
            application = self.request.user.application
            new_team = RegistrationTeam.objects.get(
                team_code=form.cleaned_data["team_code"]
            )
            old_team = application.team

            application.team = new_team
            application.save()

            # Delete the old team if it is empty
            if not old_team.applications.exists():
                old_team.delete()

        return redirect(self.get_success_url())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # In testing, the @patch decorator doesn't run in time for the jinja2
        # environment. Set the is_registration_open context here again to make sure the
        # it is reflected in templates for testing
        context["is_registration_open"] = is_registration_open

        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)

        # Pass in the review and rsvp date information
        if (
            hasattr(self.request.user, "application")
            and hasattr(self.request.user.application, "review")
            and self.request.user.application.review.decision_sent_date is not None
        ):
            review = self.request.user.application.review

            context["review"] = review
            if settings.RSVP:
                context[
                    "rsvp_passed"
                ] = _now().date() > review.decision_sent_date + timedelta(
                    days=settings.RSVP_DAYS
                )
                rsvp_deadline = datetime.combine(
                    review.decision_sent_date + timedelta(days=settings.RSVP_DAYS),
                    datetime.max.time(),  # 11:59PM
                )
                context["rsvp_deadline"] = settings.TZ_INFO.localize(
                    rsvp_deadline
                ).strftime("%B %-d, %Y, %-I:%M %p %Z")
        else:
            context["review"] = None

        # Determine the status of the user's application
        if not hasattr(self.request.user, "application"):
            context["status"] = "Application Incomplete"
        elif hasattr(self.request.user, "application") and not hasattr(
            self.request.user.application, "review"
        ):
            context["status"] = "Application Complete"
        # If the review has been done but a decision hasn't been sent out yet
        # then the user's dashboard should still show Application Complete
        elif (
            hasattr(self.request.user.application, "review")
            and self.request.user.application.review.decision_sent_date is None
        ):
            context["status"] = "Application Complete"
        elif (
            hasattr(self.request.user.application, "review")
            and self.request.user.application.review.status == "Accepted"
            and self.request.user.application.rsvp is None
        ):
            context["status"] = "Accepted, awaiting RSVP"
        elif (
            hasattr(self.request.user.application, "review")
            and self.request.user.application.review.status == "Waitlisted"
        ):
            context["status"] = "Waitlisted"
        elif (
            hasattr(self.request.user.application, "review")
            and self.request.user.application.review.status == "Rejected"
        ):
            context["status"] = "Rejected"
        elif self.request.user.application.rsvp:
            context["status"] = "Will Attend (Accepted)"
        elif not self.request.user.application.rsvp:
            context["status"] = "Cannot Attend (Declined)"
        else:
            context["status"] = "Unknown"

        # The form from ``self.get_form()`` will always be available in
        # ``context["form"]``. Naming it explicitly helps with template logic.
        if isinstance(context["form"], JoinTeamForm):
            context["join_team_form"] = context["form"]

        return context

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        """
        To avoid race conditions of two people joining an almost full team
        at the same time, this method is done atomically. This will slightly
        impact performance if lots of post requests to the dashboard are made
        at once.
        """
        return super().post(request, *args, **kwargs)


class QRScannerView(LoginRequiredMixin, FormView):
    success_url = reverse_lazy("event:qr-scanner")

    def get_template_names(self):
        if self.request.user.is_staff:
            return "event/admin_qr_scanner.html"
        return Exception("You do not have permission to view this page.")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        if isinstance(context["form"], SignInForm):
            context["sign_in_form"] = context["form"]

        return context

    def get_form(self, form_class=None):
        if form_class is not None:
            return form_class(**self.get_form_kwargs())

        if is_hackathon_happening():
            return SignInForm(**self.get_form_kwargs())

        return None

    def form_valid(self, form):
        if isinstance(form, SignInForm):
            try:
                user = User.objects.get(email__exact=form.cleaned_data["email"])
                sign_in_event = get_curr_sign_in_time()
                now = datetime.now().replace(tzinfo=settings.TZ_INFO)

                try:
                    user_activity = UserActivity.objects.get(user__exact=user)
                    setattr(user_activity, sign_in_event, now)
                    user_activity.save()
                except UserActivity.DoesNotExist:
                    sign_in_obj = {}
                    sign_in_obj[sign_in_event] = now
                    UserActivity.objects.create(user=user, **sign_in_obj)

                messages.success(
                    self.request,
                    f'User {form.cleaned_data["email"]} successfully signed in',
                )
            except NoEventOccurringException as e:
                messages.info(self.request, str(e))
            except Exception as e:
                messages.error(
                    self.request,
                    f'User {form.cleaned_data["email"]} could not sign in due to: {str(e)}',
                )

        return redirect(self.get_success_url())

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class TeamListView(mixins.ListModelMixin, generics.GenericAPIView):
    queryset = EventTeam.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [FullDjangoModelPermissions]

    filter_backends = (filters.DjangoFilterBackend, SearchFilter)
    filterset_class = TeamFilter
    search_fields = (
        "team_code",
        "id",
        "profiles__user__first_name",
        "profiles__user__last_name",
    )

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
