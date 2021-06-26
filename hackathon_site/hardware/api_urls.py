from django.urls import path, re_path
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("orders/", views.OrderView.as_view(), name="order"),
]
