from django.urls import path, re_path
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("orders/", views.OrderListView.as_view(), name="order-list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("incidents/", views.IncidentListView.as_view(), name="incident-list"),
    re_path(
        r"^hardware//$",
        views.HardwareDetailView.as_view(),
        name="hardware-detail",
    ),
]
