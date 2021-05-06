from django.urls import path

from event import api_views

app_name = "event"

urlpatterns = [
    path("users/user/", api_views.CurrentUserAPIView.as_view(), name="current-user"),
]
