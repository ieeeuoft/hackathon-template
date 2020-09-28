from django.db import models
from django.core import validators
from event.models import User
from registration.models import Application, Team


class Review(models.Model):
    STATUS_CHOICES = [
        ("Accepted", "Accepted"),
        ("Waitlisted", "Waitlisted"),
        ("Rejected", "Rejected"),
    ]
    max_validator = validators.MaxValueValidator(10)
    min_validator = validators.MinValueValidator(0)

    reviewer = models.ForeignKey(
        User, related_name="reviews", on_delete=models.SET_NULL, null=True
    )
    application = models.OneToOneField(
        Application, on_delete=models.CASCADE, null=False
    )
    interest = models.IntegerField(
        null=False, validators=[max_validator, min_validator]
    )
    experience = models.IntegerField(
        null=False, validators=[max_validator, min_validator]
    )
    quality = models.IntegerField(null=False, validators=[max_validator, min_validator])
    reviewer_comments = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=64, choices=STATUS_CHOICES, null=False)
    decision_sent_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return f"{self.application.user.first_name} {self.application.user.last_name}"


class TeamReview(Team):
    """
    Proxy model for registration.Team that lets us register it twice with the admin site

    The ModelAdmin in registration/admin.py is the standard implementation which can be used
    for view teams and inline applications with full information.

    This proxy model is registered with a custom inline form for Applications, to support
    extra review fields.
    """

    class Meta:
        proxy = True
        verbose_name = "Team"
