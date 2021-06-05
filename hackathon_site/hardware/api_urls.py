from django.urls import path
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("orders/", views.HardwareOrderListView.as_view(), name="hardware-order-list",),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
]
