from django.urls import path, include
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view()),
    path("categories/", views.CategoryListView.as_view()),
]
