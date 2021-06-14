from django.urls import path, re_path, include
from hardware import views
from rest_framework import routers


app_name = "hardware"

router = routers.DefaultRouter()
router.register(r"orders", views.OrderViewSet, basename="order")

urlpatterns = [
    path("hardware/", views.HardwareListView.as_view(), name="hardware-list",),
    path("categories/", views.CategoryListView.as_view(), name="category-list"),
    re_path(
        r"^hardware/(?P<pk>[0-9]+)/$",
        views.HardwareDetailView.as_view(),
        name="hardware-detail",
    ),
    path("", include(router.urls)),
]
