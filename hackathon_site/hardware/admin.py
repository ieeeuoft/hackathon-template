import os
from urllib.parse import urlparse

import requests
from client_side_image_cropping import ClientsideCroppingWidget, DcsicAdminMixin
from django import forms
from django.contrib import admin
from django.core.files.base import ContentFile
from django.db import models
from django.utils.html import mark_safe
from import_export import resources
from import_export.admin import ImportMixin
from import_export.widgets import ManyToManyWidget
from import_export.fields import Field

from hardware.models import Hardware, Category, Order, Incident, OrderItem


class OrderInline(admin.TabularInline):
    model = Order
    extra = 0
    fields = ("id", "status", "updated_at", "created_at")
    readonly_fields = ("id", "updated_at", "created_at")


class HardwareCategoryInline(admin.TabularInline):
    model = Hardware.categories.through
    extra = 0
    readonly_fields = (
        "hardware",
        "name",
        "model_number",
        "manufacturer",
        "datasheet",
        "quantity_available",
        "quantity_remaining",
        "max_per_team",
    )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("hardware")

    @staticmethod
    def name(obj):
        return obj.hardware.name

    @staticmethod
    def model_number(obj):
        return obj.hardware.model_number

    @staticmethod
    def manufacturer(obj):
        return obj.hardware.manufacturer

    @staticmethod
    def datasheet(obj):
        url = f'<a href="{obj.hardware.datasheet}">{obj.hardware.datasheet}</a>'
        return mark_safe(url)

    @staticmethod
    def quantity_available(obj):
        return obj.hardware.quantity_available

    @staticmethod
    def quantity_remaining(obj):
        return obj.hardware.quantity_remaining

    @staticmethod
    def max_per_team(obj):
        return obj.hardware.max_per_team


class OrderItemForm(forms.ModelForm):
    class Meta:
        model = OrderItem
        fields = ("hardware", "part_returned_health")

    def clean_hardware(self):
        value = self.cleaned_data["hardware"]
        if self.instance and value != self.instance.hardware:
            raise forms.ValidationError(
                "Cannot change hardware after the order item is created. "
                f"Change back to {self.instance.hardware}."
            )
        return value


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    form = OrderItemForm
    extra = 0
    autocomplete_fields = ("hardware",)
    readonly_fields = (
        "id",
        "name",
        "model_number",
        "manufacturer",
        "datasheet",
        "quantity_available",
        "quantity_remaining",
        "max_per_team",
        "categories",
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("hardware", "order__team")
            .prefetch_related("hardware__categories")
        )

    @staticmethod
    def name(obj: OrderItem):
        return obj.hardware.name

    @staticmethod
    def model_number(obj: OrderItem):
        return obj.hardware.model_number

    @staticmethod
    def manufacturer(obj: OrderItem):
        return obj.hardware.manufacturer

    @staticmethod
    def datasheet(obj: OrderItem):
        url = f'<a href="{obj.hardware.datasheet}">{obj.hardware.datasheet}</a>'
        return mark_safe(url)

    @staticmethod
    def quantity_available(obj: OrderItem):
        return obj.hardware.quantity_available

    @staticmethod
    def quantity_remaining(obj: OrderItem):
        """
        Get the quantity remaining by querying the Hardware model, which has the
        necessary annotations.

        This is quite inefficient, as every order item will generate a database
        hit. That admin site should not be used heavily, so that's fine. If
        performance becomes an issue, the hardware queryset can be cached on
        a per-request basis to use here (probably in OrderAdmin.get_queryset).
        """
        return Hardware.objects.get(id=obj.hardware_id).quantity_remaining

    @staticmethod
    def max_per_team(obj: OrderItem):
        return obj.hardware.max_per_team

    @staticmethod
    def categories(obj: OrderItem):
        return ", ".join(c.name for c in obj.hardware.categories.all())


class IncidentInline(admin.TabularInline):
    model = OrderItem
    verbose_name = "Incident"
    verbose_name_plural = "Incidents"
    extra = 0
    readonly_fields = ("hardware", "state", "description", "time_occurred")
    exclude = ("part_returned_health",)

    @staticmethod
    def state(obj: OrderItem):
        return obj.incident.state

    @staticmethod
    def description(obj: OrderItem):
        return obj.incident.description

    @staticmethod
    def time_occurred(obj: OrderItem):
        return obj.incident.time_occurred

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("incident")
            .filter(incident__isnull=False)
        )

    def has_add_permission(self, request, obj):
        return False


class CategoryResource(resources.ModelResource):
    class Meta:
        model = Category
        exclude = (
            "id",
            "created_at",
            "updated_at",
        )
        import_id_fields = ("name",)


@admin.register(Category)
class CategoryAdmin(ImportMixin, admin.ModelAdmin):
    resource_class = CategoryResource
    list_display = ("id", "name", "max_per_team")
    list_display_links = ("id", "name")
    search_fields = ("id", "name")
    inlines = (HardwareCategoryInline,)


class HardwareResource(resources.ModelResource):
    categories = Field(
        column_name="categories",
        attribute="categories",
        widget=ManyToManyWidget(Category, ",", "name"),
    )

    class Meta:
        model = Hardware
        exclude = (
            "id",
            "created_at",
            "updated_at",
            "picture",
        )
        import_id_fields = (
            "name",
            "model_number",
            "manufacturer",
        )


@admin.register(Hardware)
class HardwareAdmin(DcsicAdminMixin, ImportMixin, admin.ModelAdmin):
    resource_class = HardwareResource
    list_display = (
        "id",
        "name",
        "model_number",
        "manufacturer",
        "get_datasheet_link",
        "quantity_available",
        "get_quantity_remaining",
        "max_per_team",
    )
    list_display_links = ("id", "name")
    search_fields = ("id", "name", "model_number", "manufacturer")
    autocomplete_fields = ("categories",)
    formfield_overrides = {
        models.ImageField: {
            "widget": ClientsideCroppingWidget(
                width=600, height=600, preview_width=150, preview_height=150
            )
        }
    }

    @admin.display(ordering="quantity_remaining", description="Quantity Remaining")
    def get_quantity_remaining(self, obj):
        return obj.quantity_remaining

    @admin.display(ordering="datasheet", description="datasheet")
    def get_datasheet_link(self, obj):
        url = f'<a href="{obj.datasheet}">{obj.datasheet}</a>'
        return mark_safe(url)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "get_team_code", "status", "updated_at", "created_at")
    list_filter = ("status",)
    list_display_links = (
        "id",
        "get_team_code",
    )
    fields = ("team", "status")
    search_fields = ("id", "team__team_code")
    inlines = (
        OrderItemInline,
        IncidentInline,
    )
    list_select_related = True
    autocomplete_fields = ("team",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("team")

    @admin.display(description="Team Code")
    def get_team_code(self, obj: Order):
        return obj.team.team_code if obj.team else None


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_id",
        "hardware_id",
        "part_returned_health",
    )
    search_fields = ("id", "order__team__team_code", "hardware__name")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("order__team", "hardware")


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("id", "get_team_code", "state", "time_occurred")
    list_display_links = ("id", "get_team_code")
    list_filter = ("state",)
    autocomplete_fields = ("order_item",)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("order_item__order__team")

    @admin.display(description="Team Code")
    def get_team_code(self, obj: Incident):
        return (
            obj.order_item.order.team.team_code if obj.order_item.order.team else None
        )
