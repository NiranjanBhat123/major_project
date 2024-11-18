import uuid
from django.db import models
from django.core.validators import (
    MinLengthValidator, 
    MaxLengthValidator,
    RegexValidator,
    EmailValidator
)
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password

class Client(models.Model):
    """
    Represents a client or user in the platform who requests services.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the client")
    )
    name = models.CharField(
        max_length=20,  # Set maximum length to 20
        validators=[
            MinLengthValidator(2, _("Client name must be at least 2 characters long")),
            MaxLengthValidator(20, _("Client name cannot exceed 20 characters"))  # Set max length validator to 20
        ],
        help_text=_("Full name of the client")
    )
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator(message=_("Enter a valid email address"))],
        help_text=_("Client's email address")
    )
    password = models.CharField(
        max_length=128,  # Adjust to store the hashed value (hashes are typically longer)
        validators=[MinLengthValidator(5, _("Password must be at least 5 characters long"))],  # Set minimum length to 5
        help_text=_("Client's password (stored as a hashed value)")
    )
    mobile_number = models.CharField(
        max_length=10,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',  # Exactly 10 digits
                message=_("Enter a valid 10-digit phone number")
            )
        ],
        unique=True,
        help_text=_("Client's mobile number for contact")
    )
    street_address = models.CharField(
        max_length=255,
        help_text=_("Street address of the client")
    )
    city = models.CharField(
        max_length=100,
        help_text=_("City where the client resides")
    )
    state = models.CharField(
        max_length=100,
        help_text=_("State where the client resides")
    )
    postal_code = models.CharField(
        max_length=6,
        validators=[
            RegexValidator(
                regex=r'^\d{6}$',  # Exactly 6 digits
                message=_("Postal code must be exactly 6 digits")
            )
        ],
        help_text=_("Client's postal code")
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Latitude of the client's location"),
        null=True, blank=True
        
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Longitude of the client's location"),
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = _("Client")
        verbose_name_plural = _("Clients")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Hash password before saving."""
        if not self.pk:  # Only hash if password is new (on initial save)
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def get_full_address(self):
        """Returns the full address of the client as a string."""
        return f"{self.street_address}, {self.city}, {self.state}, {self.postal_code}"
