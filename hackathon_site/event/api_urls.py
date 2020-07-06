from django.urls import path

from event import views

app_name = "event"

urlpatterns = [
    path("users/user/", views.CurrentUserAPIView.as_view(), name="current-user"),
]
