from django.contrib.auth import views as auth_views
from django.urls import path
from event.views import IndexView, DashboardView

app_name = "event"

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path(
        "accounts/login/",
        auth_views.LoginView.as_view(template_name="event/login.html"),
        name="login",
    ),
    path("dashboard/", DashboardView.as_view(), name="dashboard")
]
