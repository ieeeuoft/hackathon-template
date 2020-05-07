from django.db import models
from django.contrib.auth.models import User

import uuid


def _generate_team_code():
    team_code = uuid.uuid4().hex[:5].upper()
    while TeamApplied.objects.filter(team_code=team_code).exists():
        team_code = uuid.uuid4().hex[:5].upper()
    return team_code


class TeamApplied(models.Model):
    team_code = models.CharField(max_length=5, default=_generate_team_code, null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    MAX_MEMBERS = 4

    def __str__(self):
        return self.team_code


class Application(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    team_applied = models.ForeignKey(TeamApplied, on_delete=models.CASCADE, null=False)

    # User Submitted Fields
    preferred_name = models.CharField(max_length=255, null=False)
    birthday = models.DateField(auto_now=False, auto_now_add=False)
    gender = models.CharField(max_length=50, null=False)
    phone_number = models.CharField(max_length=20, null=False)
    resume_path = models.CharField(max_length=255, null=False)
    q1 = models.TextField(null=False)
    q2 = models.TextField(null=False)
    q3 = models.TextField(null=False)
    mlh_conduct_agree = models.BooleanField()
    mlh_data_agree = models.BooleanField()

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.preferred_name
