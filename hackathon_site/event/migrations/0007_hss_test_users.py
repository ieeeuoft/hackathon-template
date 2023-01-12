from django.db import migrations
from django.contrib.auth.management import create_permissions


def apply_migration(apps, schema_editor):
    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    group, _ = Group.objects.get_or_create(name="HSS Test Users")
    group.save()


def revert_migration(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name="HSS Test Users").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("event", "0006_profile_phone_number"),
    ]
    operations = [migrations.RunPython(apply_migration, revert_migration)]
