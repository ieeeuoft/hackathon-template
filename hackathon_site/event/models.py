from django.db import models
from django.contrib.auth.models import User

import uuid


def _generate_team_code():
    team_code = uuid.uuid4().hex[:5].upper()
    while TeamEvent.objects.filter(team_code=team_code).exists():
        team_code = uuid.uuid4().hex[:5].upper()
    return team_code


class TeamEvent(models.Model):
    team_code = models.CharField(max_length=5, default=_generate_team_code, null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    MAX_MEMBERS = 4

    def __str__(self):
        return self.team_code


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team_event = models.ForeignKey(TeamEvent, on_delete=models.CASCADE, null=False)
    status = models.CharField(max_length=64, default=None, null=True)
    id_provided = models.BooleanField(null=True)
    attended = models.BooleanField(null=True)
    acknowledge_rules = models.BooleanField(null=True)
    e_signature = models.TextField(null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def __str__(self):
        return self.user.name
