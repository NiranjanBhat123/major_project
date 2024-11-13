import uuid
from django.db import models
from django.core.validators import (
    MinLengthValidator, 
    MaxLengthValidator,
    RegexValidator,
    MinValueValidator,
    MaxValueValidator
)
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

def validate_image_size(value):
    """Validate that the image size is less than 2MB."""
    filesize = value.size
    if filesize > 2 * 1024 * 1024:
        raise ValidationError(_("Maximum file size allowed is 2MB"))

class Service(models.Model):
    """
    Main services offered on the platform (e.g., Plumbing, Electrical, Cleaning).
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the service")
    )
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(2, _("Service name must be at least 2 characters long")),
            MaxLengthValidator(100, _("Service name cannot exceed 100 characters"))
        ],
        unique=True,
        help_text=_("Name of the service category")
    )
    image = models.ImageField(
        upload_to='services', 
        null=True,
        blank=True,
        validators=[validate_image_size],
        help_text=_("Optional image representing the service (max 2MB)")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _("Service")
        verbose_name_plural = _("Services")

    def __str__(self):
        return self.name

    def get_sub_services_count(self):
        """Returns the count of sub-services under this service."""
        return self.sub_services.count()
    
    def get_providers_count(self):
        """Get count of providers offering this service through sub-services"""
        return len(set(
            provider.id 
            for sub_service in self.sub_services.all()
            for provider in sub_service.providers.all()
        ))
