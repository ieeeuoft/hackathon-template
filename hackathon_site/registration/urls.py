from django.views.generic.base import TemplateView
from django.urls import path
from registration import views
from django_registration.backends.activation.views import ActivationView

app_name = "registration"

urlpatterns = [
    path("signup/", views.SignUpView.as_view(), name="signup"),
    path("activate/<str:activation_key>/", ActivationView.as_view(), name="activate",),
    path(
        "signup/complete/",
        TemplateView.as_view(template_name="registration/pending_activation.html"),
        name="signup_complete",
    ),
]
