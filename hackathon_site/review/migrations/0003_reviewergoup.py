# Generated by Django 3.1.8 on 2021-06-04 02:42

from django.db import migrations
from django.contrib.auth.management import create_permissions

REVIEWER_PERMISSIONS = (
    "auth.view_user",
    "registration.view_application",
    "review.add_review",
    "review.change_review",
    "review.view_review",
    "review.view_teamreview",
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

    group, _ = Group.objects.get_or_create(name="Application Reviewers")

    for permission_name in REVIEWER_PERMISSIONS:
        app_label, codename = permission_name.split(".", 1)
        permission = Permission.objects.get(
            content_type__app_label=app_label, codename=codename
        )
        group.permissions.add(permission)

    group.save()


def revert_migration(apps, schema_editor):
    Group = apps.get_model("auth", "Group")
    Group.objects.filter(name="Application Reviewers").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("review", "0002_teamreview"),
    ]

    operations = [migrations.RunPython(apply_migration, revert_migration)]