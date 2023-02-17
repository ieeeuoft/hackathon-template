from django.db import models
from django.db.models import Count, F, Q

from event.models import Team as TeamEvent


class Category(models.Model):
    class Meta:
        verbose_name_plural = "categories"

    name = models.CharField(max_length=255, null=False)
    max_per_team = models.IntegerField(null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name


class AnnotatedHardwareManager(models.Manager):
    def get_queryset(self):
        return (
            super()
            .get_queryset()
            .annotate(
                quantity_checked_out=Count(
                    "order_items",
                    filter=(
                        ~Q(order_items__part_returned_health="Healthy")
                        & ~Q(order_items__order__status="Cancelled")
                    ),
                    distinct=True,
                )
            )
            .annotate(
                quantity_remaining=(F("quantity_available") - F("quantity_checked_out"))
            )
        )


class Hardware(models.Model):
    objects = AnnotatedHardwareManager()

    class Meta:
        verbose_name_plural = "hardware"

    class Config:
        annotated_fields = ("quantity_checked_out", "quantity_remaining")

    name = models.CharField(max_length=255, null=False)
    model_number = models.CharField(max_length=255, null=True, blank=True)
    manufacturer = models.CharField(max_length=255, null=True, blank=True)
    datasheet = models.URLField(null=True, blank=True)
    quantity_available = models.IntegerField(null=False)
    notes = models.TextField(null=True, blank=True)
    max_per_team = models.IntegerField(null=True)
    picture = models.ImageField(
        upload_to="uploads/hardware/pictures/", null=True, blank=True
    )
    image_url = models.CharField(max_length=500, null=True, blank=True)
    categories = models.ManyToManyField(Category)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def refresh_from_db(self, using=None, fields=None):
        super().refresh_from_db(using, fields)

        # Fetch the queryset again to populate the annotations. This is somewhat
        # inefficient since it performs the query twice, so use sparingly.
        db_instance_qs = self.__class__.objects.filter(pk=self.pk)
        db_instance = db_instance_qs.get()

        for field_name in self.Config.annotated_fields:
            setattr(self, field_name, getattr(db_instance, field_name))

    def __str__(self):
        return f"{self.name} | {self.manufacturer}"


class OrderItem(models.Model):
    HEALTH_CHOICES = [
        ("Healthy", "Healthy"),
        ("Heavily Used", "Heavily Used"),
        ("Broken", "Broken"),
        ("Lost", "Lost"),
    ]
    order = models.ForeignKey(
        "Order", null=False, on_delete=models.CASCADE, related_name="items"
    )
    hardware = models.ForeignKey(
        Hardware, null=False, on_delete=models.CASCADE, related_name="order_items"
    )
    part_returned_health = models.CharField(
        max_length=64, choices=HEALTH_CHOICES, null=True, blank=True
    )

    def __str__(self):
        return f"{self.id} | {self.hardware.name} | Team {self.order.team.team_code}"


class Order(models.Model):
    STATUS_CHOICES = [
        ("Submitted", "Submitted"),
        ("Ready for Pickup", "Ready for Pickup"),
        ("Picked Up", "Picked Up"),
        ("Cancelled", "Cancelled"),
    ]

    hardware = models.ManyToManyField(Hardware, through=OrderItem)
    team = models.ForeignKey(TeamEvent, on_delete=models.CASCADE, null=False)
    status = models.CharField(
        max_length=64, choices=STATUS_CHOICES, default="Submitted"
    )
    request = models.JSONField(null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.id}"


class Incident(models.Model):
    STATE_CHOICES = [
        ("Heavily Used", "Heavily Used"),
        ("Broken", "Broken"),
        ("Missing", "Missing"),
        ("Minor Repair Required", "Minor Repair Required"),
        ("Major Repair Required", "Major Repair Required"),
        ("Not Sure If Works", "Not Sure If Works"),
    ]
    state = models.CharField(max_length=64, choices=STATE_CHOICES, null=False)
    time_occurred = models.DateTimeField(auto_now=False, auto_now_add=False, null=False)
    description = models.TextField(null=False)
    order_item = models.OneToOneField(
        OrderItem, related_name="incident", null=False, on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.id}"
