from django.urls import path
from event.views import IndexView

app_name = "event"

urlpatterns = [path("", IndexView.as_view(), name="index")]
