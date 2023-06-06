from django.db.models.signals import post_delete
from django.dispatch import receiver
from event.models import Profile, Team


@receiver(post_delete, sender=Profile, dispatch_uid="profile_delete_signal")
def delete_profile(sender, instance, **kwargs):
    """
    When Teams are deleted, Profiles trigger a post_delete signal due to the
    on_delete=CASCADE rule. This may cause errors here when Profiles try
    to delete a team which has already been deleted due to a previous Profile.
    Only the first Profile will not raise a Team.DoesNotExist exception and
    delete the team properly, remaining Profiles do not need to do so
    """

    try:
        team = instance.team
    except Team.DoesNotExist:
        return
    if team.profiles.count() == 0:
        team.delete()
