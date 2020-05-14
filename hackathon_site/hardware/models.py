from django.db import models
from event.models import Team as TeamEvent

# Create your models here.


class Category(models.Model):
    class Meta:
        verbose_name_plural = "categories"

    name = models.CharField(max_length=255, null=False)
    max_per_team = models.IntegerField(null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name


class Hardware(models.Model):
    class Meta:
        verbose_name_plural = "hardware"

    name = models.CharField(max_length=255, null=False)
    model_number = models.CharField(max_length=255, null=False)
    manufacturer = models.CharField(max_length=255, null=False)
    datasheet = models.URLField(null=False)
    quantity_available = models.IntegerField(null=False)
    notes = models.TextField(null=True)
    max_per_team = models.IntegerField(null=True)
    picture = models.FileField(upload_to="hardware/pictures/", null=False)
    categories = models.ManyToManyField(Category)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name


class Order(models.Model):
    HEALTH_CHOICES = [
        ("Healthy", "Healthy"),
        ("Heavily Used", "Heavily Used"),
        ("Broken", "Broken"),
    ]
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Ready for Pickup", "Ready for Pickup"),
        ("Picked Up", "Picked Up"),
        ("Returned", "Returned"),
        ("Lost", "Lost"),
    ]

    hardware = models.ForeignKey(Hardware, on_delete=models.CASCADE, null=False)
    team = models.ForeignKey(TeamEvent, on_delete=models.CASCADE, null=False)
    part_returned_health = models.CharField(
        max_length=64, choices=HEALTH_CHOICES, null=True
    )
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, default="Pending")

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.id


class Incident(models.Model):
    STATE_CHOICES = [
        ("Heavily Used", "Heavily Used"),
        ("Broken", "Broken"),
        ("Missing", "Missing"),
        ("Minor Repair Required", "Minor Repair Required"),
        ("Major Repair Required", "Major Repair Required"),
        ("Not Sure If Works", "Not Sure If Works"),
    ]
    order = models.ForeignKey(Order, on_delete=models.CASCADE, null=False)
    state = models.CharField(max_length=64, choices=STATE_CHOICES, null=False)
    time_occurred = models.DateTimeField(auto_now=False, auto_now_add=False, null=False)
    description = models.TextField(null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.id
