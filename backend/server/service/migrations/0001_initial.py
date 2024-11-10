# Generated by Django 4.2.16 on 2024-11-09 05:52

import django.core.validators
from django.db import migrations, models
import service.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the service', primary_key=True, serialize=False)),
                ('name', models.CharField(help_text='Name of the service category', max_length=100, unique=True, validators=[django.core.validators.MinLengthValidator(2, 'Service name must be at least 2 characters long'), django.core.validators.MaxLengthValidator(100, 'Service name cannot exceed 100 characters')])),
                ('image', models.ImageField(blank=True, help_text='Optional image representing the service (max 2MB)', null=True, upload_to='services', validators=[service.models.validate_image_size])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Service',
                'verbose_name_plural': 'Services',
                'ordering': ['name'],
            },
        ),
    ]