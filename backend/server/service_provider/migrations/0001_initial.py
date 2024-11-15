# Generated by Django 4.2.16 on 2024-11-09 09:16

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import service_provider.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('service', '0001_initial'),
        ('sub_service', '0002_subservice_is_default_alter_subservice_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProviderService',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('price', models.DecimalField(decimal_places=2, help_text='Price for this service', max_digits=10, validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(1000000)])),
                ('is_active', models.BooleanField(default=True, help_text='Indicates if the provider is currently offering this service')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Provider Service',
                'verbose_name_plural': 'Provider Services',
            },
        ),
        migrations.CreateModel(
            name='ServiceProvider',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='Unique identifier for the service provider', primary_key=True, serialize=False)),
                ('first_name', models.CharField(help_text="Provider's first name", max_length=50, validators=[django.core.validators.MinLengthValidator(2)])),
                ('last_name', models.CharField(help_text="Provider's last name", max_length=50, validators=[django.core.validators.MinLengthValidator(2)])),
                ('aadhaar', models.CharField(help_text='12-digit Aadhaar number', max_length=12, unique=True, validators=[django.core.validators.RegexValidator(message='Aadhaar number must be 12 digits', regex='^[0-9]{12}$')])),
                ('gender', models.CharField(choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], help_text="Provider's gender", max_length=1)),
                ('mobile_number', models.CharField(help_text='10-digit mobile number', max_length=10, unique=True, validators=[django.core.validators.RegexValidator(message='Mobile number must be 10 digits', regex='^[0-9]{10}$')])),
                ('photo', models.ImageField(help_text="Provider's photo (max 2MB)", upload_to='providers', validators=[service_provider.models.validate_image_size])),
                ('street_address', models.CharField(help_text='Street address', max_length=255)),
                ('city', models.CharField(help_text='City name', max_length=100)),
                ('state', models.CharField(help_text='State name', max_length=100)),
                ('postal_code', models.CharField(help_text='6-digit postal code', max_length=6, validators=[django.core.validators.RegexValidator(message='Postal code must be 6 digits', regex='^[0-9]{6}$')])),
                ('latitude', models.DecimalField(decimal_places=6, help_text='Latitude coordinate', max_digits=9, validators=[django.core.validators.MinValueValidator(-90), django.core.validators.MaxValueValidator(90)])),
                ('longitude', models.DecimalField(decimal_places=6, help_text='Longitude coordinate', max_digits=9, validators=[django.core.validators.MinValueValidator(-180), django.core.validators.MaxValueValidator(180)])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('main_service', models.ForeignKey(help_text='Main service category this provider belongs to', on_delete=django.db.models.deletion.PROTECT, related_name='providers', to='service.service')),
                ('sub_services', models.ManyToManyField(help_text='Sub-services offered by this provider', related_name='providers', through='service_provider.ProviderService', to='sub_service.subservice')),
            ],
            options={
                'verbose_name': 'Service Provider',
                'verbose_name_plural': 'Service Providers',
                'ordering': ['first_name', 'last_name'],
            },
        ),
        migrations.AddField(
            model_name='providerservice',
            name='provider',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='provider_services', to='service_provider.serviceprovider'),
        ),
        migrations.AddField(
            model_name='providerservice',
            name='sub_service',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='provider_services', to='sub_service.subservice'),
        ),
        migrations.AlterUniqueTogether(
            name='providerservice',
            unique_together={('provider', 'sub_service')},
        ),
    ]
