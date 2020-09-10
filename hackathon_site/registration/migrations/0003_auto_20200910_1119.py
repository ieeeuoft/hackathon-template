# Generated by Django 3.1.1 on 2020-09-10 15:19

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("registration", "0002_auto_20200908_1405"),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="team",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="applications",
                to="registration.team",
            ),
        ),
    ]
