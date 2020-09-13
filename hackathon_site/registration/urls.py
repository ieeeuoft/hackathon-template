from django.conf import settings
from django.views.generic.base import TemplateView
from django.urls import path
from registration import views

app_name = "registration"

urlpatterns = [
    path("signup/", views.SignUpView.as_view(), name="signup"),
    path(
        "signup/complete/",
        TemplateView.as_view(
            template_name="registration/pending_activation.html",
            extra_context={"from_email": settings.DEFAULT_FROM_EMAIL},
        ),
        name="signup_complete",
    ),
    path(
        "signup/closed/",
        TemplateView.as_view(
            template_name="registration/signup_closed.html",
            extra_context={
                "hackathon_name": settings.HACKATHON_NAME,
                "email": settings.CONTACT_EMAIL,
                "registration_close_date": settings.REGISTRATION_CLOSE_DATE,
            },
        ),
        name="signup_closed",
    ),
    path(
        "activate/<str:activation_key>/",
        views.ActivationView.as_view(),
        name="activate",
    ),
    path("application/", views.ApplicationView.as_view(), name="application"),
    path("leave_team/", views.LeaveTeamView.as_view(), name="leave-team"),
]
