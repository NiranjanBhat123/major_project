from kafka import KafkaProducer
import json

class NotificationProducer:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=['localhost:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )

    def send_notification(self, notification_data):
        self.producer.send('notifications', notification_data)
        self.producer.flush()
