# Generated by Django 3.1.8 on 2021-06-04 02:42

from django.db import migrations
from django.contrib.auth.management import create_permissions

HARDWARE_SITE_ADMINS = (
    "event.view_team",
    "event.change_team",
    "event.delete_team",
    "hardware.view_category",
    "hardware.change_category",
    "hardware.add_category",
    "hardware.delete_category",
    "hardware.view_hardware",
    "hardware.change_hardware",
    "hardware.add_hardware",
    "hardware.delete_hardware",
    "hardware.view_incident",
    "hardware.change_incident",
    "hardware.add_incident",
    "hardware.delete_incident",
    "hardware.view_order",
    "hardware.change_order",
    "hardware.delete_order",
    "hardware.view_orderitem",
    "hardware.change_orderitem",
)


def apply_migration(apps, schema_editor):
    # Permissions and content types are normally created after migrations. So in order
    # for this migration to work on a new db, we need to explicitly create permissions
    # early.

    for app_config in apps.get_app_configs():
        app_config.models_module = True
        create_permissions(app_config, apps=apps, verbosity=0)
        app_config.models_module = None

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    group, _ = Group.objects.get_or_create(name="Hardware Site Admins")

    for permission_name in HARDWARE_SITE_ADMINS:
        app_label, codename = permission_name.split(".", 1)
        print(app_label)
        print(codename)
        permission = Permission.objects.get(
            content_type__app_label=app_label, codename=codename
        )
        group.permissions.add(permission)

    group.save()


def revert_migration(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name="Hardware Site Admins").delete()


class Migration(migrations.Migration):
    dependencies = [
        ("event", "0003_remove_profile_status"),
        ("hardware", "0007_order_request"),
    ]
    operations = [migrations.RunPython(apply_migration, revert_migration)]
