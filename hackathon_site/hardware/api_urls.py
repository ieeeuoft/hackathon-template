from django.urls import path
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("orders/", views.OrderListView.as_view(), name="order-list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("incidents/", views.IncidentListView.as_view(), name="incident-list"),
    path(
        "hardware/<int:pk>/",
        views.HardwareDetailView.as_view(),
        name="hardware-detail",
    ),
    path("orders/<int:pk>/", views.OrderDetailView.as_view(), name="order-detail",),
]
