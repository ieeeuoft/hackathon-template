from django.urls import path, include

app_name = "api"

urlpatterns = [
    path("auth/", include("dj_rest_auth.urls")),
    path("hardware/", include("hardware.api_urls", namespace="hardware")),
]
