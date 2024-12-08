import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinLengthValidator,MinValueValidator,MaxValueValidator
from django.conf import settings
from service.models import Service
from client.models import Client
from service_provider.models import ServiceProvider
from service_provider.models import ProviderService
from sub_service.models import SubService


class OrderStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    ACCEPTED = 'accepted', _('Accepted')
    COMPLETED = 'completed', _('Completed')
    CANCELLED = 'cancelled', _('Cancelled')
    REJECTED = 'rejected', _('Rejected')


class Orders(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the order")
    )

    user = models.ForeignKey(
        Client,
        on_delete=models.PROTECT,
        related_name='orders',
        help_text=_("Client who placed the order")
    )
    provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.PROTECT,
        related_name='orders',
        help_text=_("Service provider chosen for this order")
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='orders',
        help_text=_("Main service chosen for this order")
    )
    ordered_on = models.DateTimeField(auto_now_add=True, help_text=_(
        "Timestamp of when the order was created"))
    scheduled_on = models.DateTimeField(help_text=_(
        "Scheduled date and time for the service"))
    otp = models.CharField(
        max_length=6,
        validators=[MinLengthValidator(6)],
        help_text=_("6-character OTP for verification")
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING,
        help_text=_("Current status of the order")
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text=_("Total cost of the order")
    )
    client_latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Latitude of the client's location"),
        null=True, blank=True

    )
    client_longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        help_text=_("Longitude of the client's location"),
        null=True, blank=True
    )
    review = models.TextField(
        null=True,
        blank=True,
        help_text=_("Optional feedback from the client after order completion")
    )
    rating = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        help_text=_("Rating provided by the client (1 to 5)")
    )

    def __str__(self):
        return f"Order {self.id} by {self.user} - {self.service.name}"


class OrderItems(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the order item")
    )
    order = models.ForeignKey(
        Orders,
        on_delete=models.CASCADE,
        related_name='items',
        help_text=_("Order this item belongs to")
    )

    provider_service = models.ForeignKey(
        ProviderService,
        on_delete=models.CASCADE,
        help_text=_("Sub service ordered by the client")
    )

    def __str__(self):
        return f"OrderItem {self.id} for {self.order} - {self.provider_service.sub_service.name}"


class OrderStatusHistory(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        help_text=_("Unique identifier for the order status history entry")
    )
    order = models.ForeignKey(
        Orders,
        on_delete=models.CASCADE,
        related_name='status_history',
        help_text=_("Order for which this status history entry is recorded")
    )
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        help_text=_("Status of the order at a particular time")
    )
    changed_on = models.DateTimeField(auto_now_add=True, help_text=_(
        "Timestamp when the status was changed"))

    def __str__(self):
        return f"Status {self.status} for Order {self.order.id} on {self.changed_on}"
