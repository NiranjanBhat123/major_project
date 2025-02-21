from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from .models import Orders, OrderStatus
from .serializers import OrderSerializer
from notifications.kafka_producer import NotificationProducer
from notifications.models import NotificationType,Notification
from notifications.utils import send_notification

class OrderCreateListView(APIView):
    permission_classes = [AllowAny]  
    
    def get(self, request):
        # Filter by client_id
        client_id = request.query_params.get('client_id')
        print(client_id)
        if client_id:
            orders = Orders.objects.filter(user_id=client_id)
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
            
        # Filter by provider_id
        provider_id = request.query_params.get('provider_id')
        print(provider_id)
        if provider_id:
            orders = Orders.objects.filter(provider_id=provider_id)
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data)
        
        return Response(
            {'error': 'Either client_id or provider_id query parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if serializer.is_valid():
            order = serializer.save()
            
            # Create notification directly without Kafka for simplicity
            provider_id = order.provider.id
            try:
                notification = Notification.objects.create(
                    recipient_client_id=order.user.id,
                    recipient_provider_id=provider_id,
                    notification_type=NotificationType.NEW_ORDER,
                    message=f"New order received from {order.user.name} for {order.service.name}",
                    order_id=order.id
                )
                send_notification(notification)
            except Exception as e:
                print(f"Error creating notification: {str(e)}")
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderStatusUpdateView(APIView):
    permission_classes = [AllowAny]
    
    def patch(self, request, order_id):
        order = get_object_or_404(Orders, id=order_id)
        new_status = request.data.get('status')
        
        # Validate status transition
        valid_transitions = {
            OrderStatus.PENDING: [OrderStatus.ACCEPTED, OrderStatus.REJECTED, OrderStatus.CANCELLED],
            OrderStatus.ACCEPTED: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REJECTED],
            OrderStatus.COMPLETED: [],  # No further transitions allowed
            OrderStatus.CANCELLED: [],  # No further transitions allowed
            OrderStatus.REJECTED: []    # No further transitions allowed
        }
        
        if new_status not in valid_transitions.get(order.status, []):
            return Response(
                {'error': 'Invalid status transition'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order status and create history entry
        order.status = new_status
        order.save()
        
        # Create status history entry
        order.status_history.create(status=new_status)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
class OrderReviewUpdateView(APIView):
    permission_classes = [AllowAny]
    
    def patch(self, request, order_id):
        order = get_object_or_404(Orders, id=order_id)
        
        # Check if order is completed
        if order.status != OrderStatus.COMPLETED:
            return Response(
                {'error': 'Only completed orders can be reviewed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if review already exists
        if order.rating and order.review:
            return Response(
                {'error': 'Review already submitted for this order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate rating
        rating = request.data.get('rating')
        review = request.data.get('review')
        
        if not rating or not review:
            return Response(
                {'error': 'Both rating and review are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update order with review and rating
        order.rating = rating
        order.review = review
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)