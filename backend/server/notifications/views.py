from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Notification
from .serialziers import NotificationSerializer
from service_provider.models import ServiceProvider
from client.models import Client

class NotificationViewSet(APIView):
    def get(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # First try to find notifications for provider
            notifications = Notification.objects.filter(
                recipient_provider_id=user_id,
                is_read=False
            ).order_by('-created_at')[:5]
            
            if not notifications.exists():
                # If no provider notifications, try client notifications
                notifications = Notification.objects.filter(
                    recipient_client_id=user_id,
                    is_read=False
                ).order_by('-created_at')[:5]
            
            serializer = NotificationSerializer(notifications, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id)
            notification.is_read = True
            notification.save()
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )