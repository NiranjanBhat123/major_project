from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

def send_notification(notification):
    try:
        channel_layer = get_channel_layer()
        # Instead of ping, you can check if the connection exists
        if not hasattr(channel_layer, 'connection'):
            print("Redis connection not established")
            return
        
        # Determine the group name based on recipient type
        if notification.recipient_provider_id:
            group_name = f'notifications_{notification.recipient_provider_id}'
        elif notification.recipient_client_id:
            group_name = f'notifications_{notification.recipient_client_id}'
        else:
            print("No recipient found for notification")
            return
            
        print(f"Sending to Redis group: {group_name}")
        
        # Ensure all data is JSON serializable
        notification_data = {
            'id': str(notification.id),
            'message': str(notification.message),
            'created_at': notification.created_at.isoformat(),
            'notification_type': str(notification.notification_type),
            'is_read': bool(notification.is_read),
            'order_id': str(notification.order_id) if notification.order_id else None,
        }
        
        print(f"Sending notification data: {notification_data}")
        
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'notification_message',
                'message': notification_data
            }
        )
        print("Successfully sent to Redis channel layer")
    except Exception as e:
        print(f"Redis send error: {str(e)}")
        # Try to reconnect to Redis
        try:
            channel_layer = get_channel_layer()
            # The flush method exists but may not reconnect
        except Exception as redis_error:
            print(f"Redis reconnection error: {str(redis_error)}")