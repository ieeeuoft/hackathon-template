from django.conf import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView

from registration.forms import JoinTeamForm
from registration.models import Team


class IndexView(TemplateView):
    template_name = "event/landing.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # In testing, the @override_settings decorator doesn't run in time for the jinja2
        # environment. Set the registration_open context here again to make sure the
        # overridden settings are reflected in the template
        context["registration_open"] = settings.REGISTRATION_OPEN

        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)
        return context


class DashboardView(LoginRequiredMixin, FormView):
    template_name = "event/dashboard_base.html"
    # Form submits should take the user back to the dashboard
    success_url = reverse_lazy("event:dashboard")

    def get_form(self, form_class=None):
        """
        The dashboard can have different forms, but not at the same time:
        - When no application has been submitted, no form.
        - Once an application has been submitted and registration is open, the JoinTeamForm.
        - Once the application has been reviewed and accepted, the RSVP form.
        - Once the application has been reviewed and rejected, no form.
        """

        if form_class is not None:
            return form_class(**self.get_form_kwargs())

        if not hasattr(self.request.user, "application"):
            return None

        if settings.REGISTRATION_OPEN:
            return JoinTeamForm(**self.get_form_kwargs())

        # Once RSVP form is implemented, more logic to choose it should go here
        return None

    def form_valid(self, form):
        """
        As above, what form we're dealing with depends on the user's progress through
        the application cycle.
        """

        if isinstance(form, JoinTeamForm):
            application = self.request.user.application
            new_team = Team.objects.get(team_code=form.cleaned_data["team_code"])
            old_team = application.team

            application.team = new_team
            application.save()

            # Delete the old team if it is empty
            if not old_team.applications.exists():
                old_team.delete()

        return redirect(self.get_success_url())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # In testing, the @override_settings decorator doesn't run in time for the jinja2
        # environment. Set the registration_open context here again to make sure the
        # overridden settings are reflected in the template
        context["registration_open"] = settings.REGISTRATION_OPEN

        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)

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
