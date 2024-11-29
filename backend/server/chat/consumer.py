import json
import base64
from io import BytesIO
from PIL import Image
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from django.core.files.base import ContentFile
from django.conf import settings
from .models import ChatMessage
from orders.models import Orders

class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        chat_history = await self.get_chat_history()
        if chat_history:
            await self.send(text_data=json.dumps({
                'type': 'chat_history',
                'messages': chat_history
            }))

    @sync_to_async
    def get_chat_history(self):
        order = Orders.objects.get(id=self.room_name)
        messages = ChatMessage.objects.filter(order=order).order_by('timestamp')
        return [{
            'message': msg.message if msg.message_type == 'TEXT' else None,
            'image_data': base64.b64encode(msg.image.read()).decode('utf-8') if msg.message_type == 'IMAGE' and msg.image else None,
            'message_type': msg.message_type,
            'sender': str(msg.sender),
            'sender_type': msg.sender_type,
            'timestamp': msg.timestamp.strftime('%I:%M %p')
        } for msg in messages]

    @sync_to_async
    def save_message(self, data):
        order = Orders.objects.get(id=self.room_name)
        message_type = data.get('message_type', 'TEXT')
        
        message_data = {
            'order': order,
            'sender': data['sender'],
            'sender_type': 'CLIENT' if data.get('is_client', True) else 'PROVIDER',
            'message_type': message_type
        }
        
        if message_type == 'TEXT':
            message_data['message'] = data['message']
        else:
            # Handle image
            img_data = data['image']
            if ';base64,' in img_data:
                header, img_data = img_data.split(';base64,')
            
            # Decode base64 image
            img_bytes = base64.b64decode(img_data)
            
            # Process image
            img = Image.open(BytesIO(img_bytes))
            
            # Compress if needed
            if img.size[0] > 1200 or img.size[1] > 1200:
                img.thumbnail((1200, 1200), Image.LANCZOS)
            
            # Save processed image
            img_io = BytesIO()
            img_format = img.format or 'JPEG'
            img.save(img_io, format=img_format, quality=85)
            img_file = ContentFile(img_io.getvalue())
            
            # Create message with image
            message = ChatMessage(**message_data)
            message.image.save(f'{message.id}.{img_format.lower()}', img_file)
            message.image_size = img_file.size
            message.save()
            return message
            
        return ChatMessage.objects.create(**message_data)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = await self.save_message(data)
        
        message_data = {
            'type': 'chat_message',
            'message_type': message.message_type,
            'sender': str(message.sender),
            'sender_type': message.sender_type,
            'timestamp': message.timestamp.strftime('%I:%M %p')
        }
        
        if message.message_type == 'TEXT':
            message_data['message'] = message.message
        else:
            # Send image data directly instead of URL
            message.image.seek(0)
            image_data = base64.b64encode(message.image.read()).decode('utf-8')
            message_data['image_data'] = image_data
        await self.channel_layer.group_send(
            self.room_group_name,
            message_data
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )