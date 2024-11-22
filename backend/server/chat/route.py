from django.urls import path
from .consumer import PersonalChatConsumer

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/', PersonalChatConsumer.as_asgi()),
]
