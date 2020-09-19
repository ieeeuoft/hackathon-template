from django.db import models
from event.models import User
from registration.models import Application


class Review(models.Model):
    STATUS_CHOICES = [
        ("Accepted", "Accepted"),
        ("Waitlisted", "Waitlisted"),
        ("Rejected", "Rejected"),
    ]

    reviewer = models.ForeignKey(
        User, related_name="reviews", on_delete=models.SET_NULL, null=False
    )
    application = models.OneToOneField(Application, on_delete=models.SET_NULL)
    interest = models.IntegerField(default=False, null=False)
    experience = models.IntegerField(default=False, null=False)
    quality = models.IntegerField(default=False, null=False)
    reviewer_comments = models.TextField(null=True)
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, null=False)
    decision_sent_date = models.DateField(null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)
