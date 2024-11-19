import uuid
from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.utils.translation import gettext_lazy as _
from service.models import Service
from django.core.exceptions import ValidationError


def validate_image_size(value):
    """Validate that the image size is less than 2MB."""
    filesize = value.size
    if filesize > 2 * 1024 * 1024:
        raise ValidationError(_("Maximum file size allowed is 2MB"))

class SubService(models.Model):
    """Sub-services available under main services"""
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the sub-service")
    )
    image = models.ImageField(
        upload_to='sub_service', 
        null=True,
        blank=True,
        validators=[validate_image_size],
        help_text=_("Optional image representing the service (max 2MB)")
    )
    name = models.CharField(
        max_length=100,
        validators=[
            MinLengthValidator(2),
            MaxLengthValidator(100)
        ],
        help_text=_("Name of the specific service")
    )
    main_service = models.ForeignKey(
        Service,
        on_delete=models.CASCADE,
        related_name='sub_services',
        help_text=_("Main service category this sub-service belongs to")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _("Sub Service")
        verbose_name_plural = _("Sub Services")
        unique_together = ['name', 'main_service']

    def __str__(self):
        return f"{self.name} ({self.main_service.name})"