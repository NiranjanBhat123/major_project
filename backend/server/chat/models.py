# # models.py
# import uuid
# from django.db import models
# from django.utils.translation import gettext_lazy as _
# from django.contrib.contenttypes.fields import GenericForeignKey
# from django.contrib.contenttypes.models import ContentType
# from client.models import Client
# from service_provider.models import ServiceProvider
# from orders.models import Orders

# class ChatMessage(models.Model):
#     """Model to store chat messages between client and service provider"""
    
#     SENDER_TYPES = [
#         ('CLIENT', 'Client'),
#         ('PROVIDER', 'Service Provider')
#     ]
    
#     id = models.UUIDField(
#         primary_key=True,
#         default=uuid.uuid4,
#         editable=False,
#         help_text=_("Unique identifier for the chat message")
#     )
#     order = models.ForeignKey(
#         Orders,
#         on_delete=models.CASCADE,
#         related_name='chat_messages',
#         help_text=_("Order associated with this chat")
#     )
#     sender_type = models.CharField(
#         max_length=10,
#         choices=SENDER_TYPES,
#         help_text=_("Type of sender (Client or Service Provider)")
#     )
#     sender = models.UUIDField(
#         help_text=_("UUID of the sender (either client_id or provider_id)")
#     )
#     message = models.TextField(
#         help_text=_("Content of the chat message")
#     )
#     timestamp = models.DateTimeField(
#         auto_now_add=True,
#         help_text=_("When the message was sent")
#     )

#     class Meta:
#         ordering = ['timestamp']
#         verbose_name = _("Chat Message")
#         verbose_name_plural = _("Chat Messages")
#         indexes = [
#             models.Index(fields=['order', 'timestamp']),
#             models.Index(fields=['sender', 'sender_type']),
#         ]

#     def __str__(self):
#         return f"Message from {self.sender_type} at {self.timestamp}"

#     @property
#     def sender_name(self):
#         """Get the name of the sender"""
#         if self.sender_type == 'CLIENT':
#             try:
#                 client = Client.objects.get(id=self.sender)
#                 return client.name
#             except Client.DoesNotExist:
#                 return "Unknown Client"
#         else:
#             try:
#                 provider = ServiceProvider.objects.get(id=self.sender)
#                 return provider.full_name
#             except ServiceProvider.DoesNotExist:
#                 return "Unknown Provider"

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
