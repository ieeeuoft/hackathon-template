from django.urls import path, re_path
from hardware import views


app_name = "hardware"

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("orders/", views.OrderListView.as_view(), name="order-list"),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    path("incidents/", views.IncidentListView.as_view(), name="incident-list"),
    re_path(
        r"^hardware/(?P<pk>[0-9]+)/$",
        views.HardwareDetailView.as_view(),
        name="hardware-detail",
    ),
    re_path(
        "hardware/(?P<order_id>[0-9]+)",
        views.HardwareListView.as_view(),
        name="update-order",
    )
    # re_path(r"^order/(?P<pk>[0-9]+)/$",
    #     views.UpdateOrderView.as_view(),
    #     name="update-order")
]
