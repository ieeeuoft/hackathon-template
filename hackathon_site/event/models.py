from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


def _generate_team_code():
    team_code = uuid.uuid4().hex[:5].upper()
    while Team.objects.filter(team_code=team_code).exists():
        team_code = uuid.uuid4().hex[:5].upper()
    return team_code


class Team(models.Model):
    team_code = models.CharField(max_length=5, default=_generate_team_code, null=False)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    project_description = models.CharField(max_length=500, null=True)

    def __str__(self):
        return self.team_code


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    team = models.ForeignKey(
        Team, related_name="profiles", on_delete=models.CASCADE, null=False
    )
    phone_number = models.CharField(max_length=20, null=False,)
    id_provided = models.BooleanField(default=False, null=False)
    attended = models.BooleanField(default=False, null=False)
    acknowledge_rules = models.BooleanField(default=False, null=False)
    e_signature = models.TextField(null=True)

    created_at = models.DateTimeField(auto_now_add=True, null=False)
    updated_at = models.DateTimeField(auto_now=True, null=False)

    def save(self, *args, **kwargs):
        if not getattr(self, "team", None):
            self.team = Team.objects.create()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.id} | {self.user.first_name} {self.user.last_name}"
