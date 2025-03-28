# Generated by Django 4.2.16 on 2024-11-09 11:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service_provider', '0002_alter_serviceprovider_sub_services'),
    ]

    operations = [
        migrations.AddField(
            model_name='serviceprovider',
            name='is_active',
            field=models.BooleanField(default=True, help_text='Indicates if the provider is currently active on the platform'),
        ),
    ]
