from django.conf import settings
from django.views.generic.base import TemplateView
from django.urls import path, re_path
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
    path("signup/closed/", views.SignUpClosedView.as_view(), name="signup_closed",),
    path(
        "activate/<str:activation_key>/",
        views.ActivationView.as_view(),
        name="activate",
    ),
    path("application/", views.ApplicationView.as_view(), name="application"),
    path("leave_team/", views.LeaveTeamView.as_view(), name="leave-team"),
    re_path("rsvp/(?P<rsvp>yes|no)/$", views.RSVPView.as_view(), name="rsvp"),
]
