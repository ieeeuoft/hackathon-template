from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "event/landing.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)
        return context


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "event/dashboard_base.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["user"] = self.request.user
        context["application"] = getattr(self.request.user, "application", None)
        return context
