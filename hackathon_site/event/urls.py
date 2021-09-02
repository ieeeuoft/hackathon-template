from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy
from event.views import IndexView, DashboardView
from event.forms import (
    PasswordChangeForm,
    PasswordResetForm,
    SetPasswordForm,
    AuthenticationForm,
)

app_name = "event"

urlpatterns = [
    path("", IndexView.as_view(), name="index"),
    path(
        "accounts/login/",
        auth_views.LoginView.as_view(
            template_name="event/login.html", form_class=AuthenticationForm
        ),
        name="login",
    ),
    path("accounts/logout/", auth_views.LogoutView.as_view(), name="logout",),
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
    path(
        "accounts/reset_password/",
        auth_views.PasswordResetView.as_view(
            template_name="event/reset_password/reset_password.html",
            success_url=reverse_lazy("event:reset_password_done"),
            form_class=PasswordResetForm,
            subject_template_name="event/reset_password/reset_password_subject.txt",
            email_template_name="event/reset_password/reset_password_email.html",
            html_email_template_name="event/reset_password/reset_password_email.html",
        ),
        name="reset_password",
    ),
    path(
        "accounts/reset_password_done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="event/reset_password/reset_password_done.html"
        ),
        name="reset_password_done",
    ),
    path(
        "accounts/reset_password_confirm/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="event/reset_password/reset_password_confirm.html",
            success_url=reverse_lazy("event:reset_password_complete"),
            form_class=SetPasswordForm,
        ),
        name="reset_password_confirm",
    ),
    path(
        "accounts/reset_password_complete/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="event/reset_password/reset_password_complete.html"
        ),
        name="reset_password_complete",
    ),
]
