import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from client.models import Client
from service_provider.models import ServiceProvider

class NotificationType(models.TextChoices):
    NEW_ORDER = 'new_order', _('New Order')
    ORDER_ACCEPTED = 'order_accepted', _('Order Accepted')
    ORDER_REJECTED = 'order_rejected', _('Order Rejected')
    ORDER_COMPLETED = 'order_completed', _('Order Completed')

class Notification(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    recipient_client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    recipient_provider = models.ForeignKey(
        ServiceProvider,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    order_id = models.UUIDField()

    class Meta:
        ordering = ['-created_at']