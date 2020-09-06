from django.contrib.auth import views as auth_views
from django.urls import path
from django.views.generic.base import TemplateView
from event.views import IndexView

app_name = "event"

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path(
        "accounts/login/",
        auth_views.LoginView.as_view(template_name="event/login.html"),
        name="login",
    ),
    path("dashboard/", TemplateView.as_view(template_name="event/dashboard_base.html"), name="dashboard")
]
