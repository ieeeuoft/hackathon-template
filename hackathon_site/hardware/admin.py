from django.contrib import admin
from django.utils.html import mark_safe
from .models import Hardware, Category, Order, Incident, OrderItem

# Register your models here.
admin.site.register(Category)
admin.site.register(Incident)
admin.site.register(OrderItem)


@admin.register(Hardware)
class HardwareAdmin(admin.ModelAdmin):
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

    @admin.display(ordering="quantity_remaining", description="Quantity Remaining")
    def get_quantity_remaining(self, obj):
        return obj.quantity_remaining

    @admin.display(ordering="datasheet", description="datasheet")
    def get_datasheet_link(self, obj):
        url = f'<a href="{obj.datasheet}">{obj.datasheet}</a>'
        return mark_safe(url)


class HardwareInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    autocomplete_fields = ("hardware",)
    readonly_fields = (
        "name",
        "model_number",
        "manufacturer",
        "datasheet",
        "quantity_available",
        "quantity_remaining",
        "max_per_team",
        "categories",
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
        return obj.hardware.quantity_remaining

    @staticmethod
    def max_per_team(obj: OrderItem):
        return obj.hardware.max_per_team

    @staticmethod
    def categories(obj: OrderItem):
        return ", ".join(c.name for c in obj.hardware.categories.all())


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "get_team_code", "status", "updated_at", "created_at")
    fields = ("team", "status")
    search_fields = ("id", "team__team_code")
    inlines = (HardwareInline,)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("team")

    @admin.display(ordering="team_code", description="Team Code")
    def get_team_code(self, obj: Order):
        return obj.team.team_code
