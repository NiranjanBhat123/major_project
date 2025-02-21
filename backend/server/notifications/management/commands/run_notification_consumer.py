from django.core.management.base import BaseCommand
from notifications.kafka_consumer import NotificationConsumer

class Command(BaseCommand):
    help = 'Starts the Kafka notification consumer'

    def handle(self, *args, **options):
        consumer = NotificationConsumer()
        consumer.start_consuming()