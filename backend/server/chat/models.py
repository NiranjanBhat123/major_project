import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import FileExtensionValidator
from orders.models import Orders    

def chat_image_path(instance, filename):
    """Generate path for chat images"""
    ext = filename.split('.')[-1]
    return f'chat_images/{instance.order.id}/{instance.id}.{ext}'

class ChatMessage(models.Model):
    MESSAGE_TYPES = [
        ('TEXT', 'Text Message'),
        ('IMAGE', 'Image Message')
    ]
    
    SENDER_TYPES = [
        ('CLIENT', 'Client'),
        ('PROVIDER', 'Service Provider')
    ]
    
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    order = models.ForeignKey(
        Orders,
        on_delete=models.CASCADE,
        related_name='chat_messages'
    )
    sender_type = models.CharField(
        max_length=10,
        choices=SENDER_TYPES
    )
    sender = models.UUIDField()
    message_type = models.CharField(
        max_length=5,
        choices=MESSAGE_TYPES,
        default='TEXT'
    )
    message = models.TextField(blank=True)
    image = models.ImageField(
        upload_to=chat_image_path,
        null=True,
        blank=True,
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png', 'gif'])]
    )
    image_size = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']
        indexes = [
            models.Index(fields=['order', 'timestamp']),
            models.Index(fields=['sender', 'sender_type']),
        ]

    def __str__(self):
        return f"{self.message_type} from {self.sender_type} at {self.timestamp}"

    @property
    def message_data(self):
        """Return message data based on type"""
        if self.message_type == 'TEXT':
            return {
                'type': 'TEXT',
                'content': self.message
            }
        else:
            return {
                'type': 'IMAGE',
                'content': self.image.url if self.image else None,
                'size': self.image_size
            }
