from django.db.models.signals import post_delete
from django.dispatch import receiver
from event.models import Profile


@receiver(post_delete, sender=Profile, dispatch_uid="profile_delete_signal")
def delete_profile(sender, instance, **kwargs):
    team = instance.team
    if team.profiles.count() == 0:
        team.delete()
