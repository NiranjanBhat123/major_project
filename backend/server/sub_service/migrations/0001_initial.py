# Generated by Django 4.2.16 on 2024-11-09 06:16

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('service', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubService',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the sub-service', primary_key=True, serialize=False)),
                ('name', models.CharField(help_text='Name of the specific service', max_length=100, validators=[django.core.validators.MinLengthValidator(2, 'Sub-service name must be at least 2 characters long'), django.core.validators.MaxLengthValidator(100, 'Sub-service name cannot exceed 100 characters')])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('main_service', models.ForeignKey(help_text='Main service category this sub-service belongs to', on_delete=django.db.models.deletion.CASCADE, related_name='sub_services', to='service.service')),
            ],
            options={
                'verbose_name': 'Sub Service',
                'verbose_name_plural': 'Sub Services',
                'ordering': ['name'],
                'unique_together': {('name', 'main_service')},
            },
        ),
    ]