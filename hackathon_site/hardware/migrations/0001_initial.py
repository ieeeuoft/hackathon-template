# Generated by Django 3.0.5 on 2020-05-13 23:03

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("event", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("max_per_team", models.IntegerField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="Hardware",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("model_number", models.CharField(max_length=255)),
                ("manufacturer", models.CharField(max_length=255)),
                ("datasheet", models.URLField()),
                ("quantity_available", models.IntegerField()),
                ("notes", models.TextField()),
                ("max_per_team", models.IntegerField()),
                ("picture", models.FileField(upload_to="hardware/pictures/")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("categories", models.ManyToManyField(to="hardware.Category")),
            ],
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "part_returned_health",
                    models.CharField(
                        choices=[
                            ("Healthy", "Healthy"),
                            ("Heavily Used", "Heavily Used"),
                            ("Broken", "Broken"),
                        ],
                        max_length=64,
                        null=True,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("Pending", "Pending"),
                            ("Ready for Pickup", "Ready for Pickup"),
                            ("Picked Up", "Picked Up"),
                            ("Returned", "Returned"),
                            ("Lost", "Lost"),
                        ],
                        default="Pending",
                        max_length=64,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "hardware",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="hardware.Hardware",
                    ),
                ),
                (
                    "team",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="event.Team"
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="Incident",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "state",
                    models.CharField(
                        choices=[
                            ("Heavily Used", "Heavily Used"),
                            ("Broken", "Broken"),
                            ("Missing", "Missing"),
                            ("Minor Repair Required", "Minor Repair Required"),
                            ("Major Repair Required", "Major Repair Required"),
                            ("Not Sure If Works", "Not Sure If Works"),
                        ],
                        max_length=64,
                    ),
                ),
                ("time_occurred", models.DateTimeField()),
                ("description", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "order",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="hardware.Order"
                    ),
                ),
            ],
        ),
    ]
