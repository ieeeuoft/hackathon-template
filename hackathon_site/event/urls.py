from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy
from event.views import IndexView, DashboardView
from event.forms import PasswordChangeForm

app_name = "event"

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path(
        "accounts/login/",
        auth_views.LoginView.as_view(template_name="event/login.html"),
        name="login",
    ),
    path(
        "accounts/logout/", auth_views.LogoutView.as_view(next_page="/"), name="logout",
    ),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path(
        "accounts/change_password/",
        auth_views.PasswordChangeView.as_view(
            template_name="event/change_password.html",
            success_url=reverse_lazy("event:change_password_done"),
            form_class=PasswordChangeForm,
        ),
        name="change_password",
    ),
    path(
        "accounts/change_password_done/",
        auth_views.PasswordChangeDoneView.as_view(
            template_name="event/change_password_done.html"
        ),
        name="change_password_done",
    ),
]
