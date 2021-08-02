from django.db.models.signals import post_delete
from django.dispatch import receiver
from registration.models import Application


@receiver(post_delete, sender=Application, dispatch_uid="application_delete_signal")
def delete_application(sender, instance, **kwargs):
    team = instance.team
    if team.applications.count() == 0:
        team.delete()
