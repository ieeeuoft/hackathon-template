# Generated by Django 3.1.8 on 2021-06-04 02:42

from django.db import migrations
from django.core.management.sql import emit_post_migrate_signal

REVIEWER_PERMISSIONS = (
    "auth.view_user",
    "registration.view_application",
    "review.add_review",
    "review.change_review",
    "review.view_review",
    "review.view_teamreview",
)


def apply_migration(apps, schema_editor):
    # Permissions and content types are created after migrations. So in order for this migration to work on a new db,
    # we need to commit the previous migrations before continuing.
    db_alias = schema_editor.connection.alias
    emit_post_migrate_signal(2, False, db_alias)

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
