# Generated by Django 4.2.16 on 2024-11-17 06:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('client', '0002_alter_client_mobile_number_alter_client_name_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='client',
            name='latitude',
            field=models.DecimalField(blank=True, decimal_places=6, help_text="Latitude of the client's location", max_digits=9, null=True),
        ),
        migrations.AlterField(
            model_name='client',
            name='longitude',
            field=models.DecimalField(blank=True, decimal_places=6, help_text="Longitude of the client's location", max_digits=9, null=True),
        ),
    ]
