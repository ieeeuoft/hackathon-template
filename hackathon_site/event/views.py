from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "event/landing.html"


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "event/dashboard_base.html"
