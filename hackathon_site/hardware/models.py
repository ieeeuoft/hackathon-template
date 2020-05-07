from django.db import models
from event.models import Team as TeamEvent

# Create your models here.


class Category(models.Model):
    name = models.CharField(max_length=255, null=False)
    max_per_category = models.IntegerField(null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name


class Hardware(models.Model):
    name = models.CharField(max_length=255, null=False)
    model_number = models.CharField(max_length=255, null=False)
    manufacturer = models.CharField(max_length=255, null=False)
    datasheet = models.TextField(null=False)
    quantity_available = models.IntegerField(null=False)
    notes = models.TextField(null=False)
    max_items_per_team = models.IntegerField(null=False)
    picture = models.TextField(null=False)
    categories = models.ManyToManyField(Category)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.name


class Order(models.Model):
    hardware_id = models.ForeignKey(Hardware, on_delete=models.CASCADE, null=False)
    team_event_id = models.ForeignKey(TeamEvent, on_delete=models.CASCADE, null=False)
    part_returned_health = models.CharField(max_length=64, null=True)
    status = models.CharField(max_length=64, null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.id


class Incident(models.Model):
    order_id = models.ForeignKey(Order, on_delete=models.CASCADE, null=False)
    state = models.CharField(max_length=64, null=False)
    time_occurred = models.DateTimeField(auto_now=False, auto_now_add=False, null=False)
    location_occurred = models.CharField(max_length=255, null=False)
    description = models.TextField(null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.id
