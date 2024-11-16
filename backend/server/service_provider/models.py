# models.py
import uuid
from django.db import models
from django.core.validators import (
    MinLengthValidator,
    RegexValidator,
    MinValueValidator,
    MaxValueValidator
)
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from sub_service.models import SubService
from service.models import Service
from django.contrib.auth.hashers import make_password

def validate_image_size(value):
    """Validate that the image size is less than 2MB."""
    filesize = value.size
    if filesize > 2 * 1024 * 1024:
        raise ValidationError(_("Maximum file size allowed is 2MB"))

class ServiceProvider(models.Model):
    """Service providers offering various services on the platform"""
    GENDER_CHOICES = [
        ('M', _('Male')),
        ('F', _('Female')),
        ('O', _('Other'))
    ]
    
    STATE_CHOICES = [
        ('Andaman and Nicobar Islands', _('Andaman and Nicobar Islands')),
        ('Andhra Pradesh', _('Andhra Pradesh')),
        ('Arunachal Pradesh', _('Arunachal Pradesh')),
        ('Assam', _('Assam')),
        ('Bihar', _('Bihar')),
        ('Chandigarh', _('Chandigarh')),
        ('Chhattisgarh', _('Chhattisgarh')),
        ('Dadra and Nagar Haveli and Daman and Diu', _('Dadra and Nagar Haveli and Daman and Diu')),
        ('Delhi', _('Delhi')),
        ('Goa', _('Goa')),
        ('Gujarat', _('Gujarat')),
        ('Haryana', _('Haryana')),
        ('Himachal Pradesh', _('Himachal Pradesh')),
        ('Jammu and Kashmir', _('Jammu and Kashmir')),
        ('Jharkhand', _('Jharkhand')),
        ('Karnataka', _('Karnataka')),
        ('Kerala', _('Kerala')),
        ('Ladakh', _('Ladakh')),
        ('Lakshadweep', _('Lakshadweep')),
        ('Madhya Pradesh', _('Madhya Pradesh')),
        ('Maharashtra', _('Maharashtra')),
        ('Manipur', _('Manipur')),
        ('Meghalaya', _('Meghalaya')),
        ('Mizoram', _('Mizoram')),
        ('Nagaland', _('Nagaland')),
        ('Odisha', _('Odisha')),
        ('Puducherry', _('Puducherry')),
        ('Punjab', _('Punjab')),
        ('Rajasthan', _('Rajasthan')),
        ('Sikkim', _('Sikkim')),
        ('Tamil Nadu', _('Tamil Nadu')),
        ('Telangana', _('Telangana')),
        ('Tripura', _('Tripura')),
        ('Uttar Pradesh', _('Uttar Pradesh')),
        ('Uttarakhand', _('Uttarakhand')),
        ('West Bengal', _('West Bengal'))
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the service provider")
    )
    main_service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='providers',
        help_text=_("Main service category this provider belongs to")
    )
    email = models.EmailField(
        unique=True,
        null=True,  # Allow null for backward compatibility
        blank=True,
        help_text=_("Email address for authentication")
    )
    password = models.CharField(
        max_length=128,
        null=True,  # Allow null for backward compatibility
        blank=True,
        help_text=_("Hashed password for authentication")
    )
    first_name = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(2)],
        help_text=_("Provider's first name")
    )
    last_name = models.CharField(
        max_length=50,
        validators=[MinLengthValidator(2)],
        help_text=_("Provider's last name")
    )
    aadhaar = models.CharField(
        max_length=12,
        unique=True,
        validators=[
            RegexValidator(
                regex='^[0-9]{12}$',
                message=_("Aadhaar number must be 12 digits")
            )
        ],
        help_text=_("12-digit Aadhaar number")
    )
    gender = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        help_text=_("Provider's gender")
    )
    mobile_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex='^[0-9]{10}$',
                message=_("Mobile number must be 10 digits")
            )
        ],
        unique=True,
        help_text=_("10-digit mobile number")
    )
    photo = models.ImageField(
        upload_to='providers',
        validators=[validate_image_size],
        help_text=_("Provider's photo (max 2MB)")
    )
    street_address = models.CharField(
        max_length=255,
        help_text=_("Street address")
    )
    city = models.CharField(
        max_length=100,
        help_text=_("City name")
    )
    state = models.CharField(
        max_length=50,
        choices=STATE_CHOICES,
        help_text=_("State in India")
    )
    postal_code = models.CharField(
        max_length=6,
        validators=[
            RegexValidator(
                regex='^[0-9]{6}$',
                message=_("Postal code must be 6 digits")
            )
        ],
        help_text=_("6-digit postal code")
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(-90),
            MaxValueValidator(90)
        ],
        help_text=_("Latitude coordinate")
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        validators=[
            MinValueValidator(-180),
            MaxValueValidator(180)
        ],
        help_text=_("Longitude coordinate")
    )
    sub_services = models.ManyToManyField(
        SubService,
        through='ProviderService',
        related_name='providers',
        help_text=_("Services offered by this provider")
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_("Indicates if the provider is currently active on the platform")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']
        verbose_name = _("Service Provider")
        verbose_name_plural = _("Service Providers")

    def __str__(self):
        return f"{self.full_name} ({self.main_service.name})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def save(self, *args, **kwargs):
            # Hash password if it's being set for the first time or changed
        if self.password and (
            not self.pk or 
            self._state.adding or 
            self.password != ServiceProvider.objects.get(pk=self.pk).password
        ):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)


    def clean(self):
        """Ensure provider can only select sub-services from their main service"""
        super().clean()
        if hasattr(self, 'provider_services'):
            invalid_services = self.provider_services.exclude(
                sub_service__main_service=self.main_service
            )
            if invalid_services.exists():
                raise ValidationError(
                    _("You can only select sub-services from your main service category.")
                )

class ProviderService(models.Model):
    """Provider's services with custom pricing"""
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        related_name='provider_services'
    )
    sub_service = models.ForeignKey(
        SubService,
        on_delete=models.CASCADE,
        related_name='provider_services'
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(1000000)
        ],
        help_text=_("Price for this service")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['provider', 'sub_service']
        verbose_name = _("Provider Service")
        verbose_name_plural = _("Provider Services")

    def __str__(self):
        return f"{self.provider.full_name} - {self.sub_service.name} (₹{self.price})"

    def clean(self):
        """Ensure the sub-service belongs to the provider's main service"""
        super().clean()
        if (self.sub_service and self.provider and 
            self.sub_service.main_service != self.provider.main_service):
            raise ValidationError(
                _("This sub-service doesn't belong to your main service category.")
            )