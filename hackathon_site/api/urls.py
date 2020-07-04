from django.urls import path, include

app_name = "api"

urlpatterns = [
    path("auth/", include("dj_rest_auth.urls")),
    path("event/", include("event.api_urls", namespace="event")),
]
