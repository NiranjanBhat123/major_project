from kafka import KafkaConsumer
import json
from .models import Notification
import django

class NotificationConsumer:
    def __init__(self):
        self.consumer = KafkaConsumer(
            'notifications',
            bootstrap_servers=['localhost:9092'],
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

    def start_consuming(self):
        for message in self.consumer:
            self.process_message(message.value)

    def process_message(self, notification_data):
        Notification.objects.create(**notification_data)