from rest_framework import serializers
from .models import Orders, OrderItems, OrderStatusHistory,OrderStatus
import random

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItems
        fields = ['id', 'provider_service']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'changed_on']
        read_only_fields = ['changed_on']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Orders
        fields = [
            'id', 'user', 'provider', 'service', 'ordered_on', 
            'scheduled_on', 'otp', 'status', 'total_price', 
            'review', 'rating', 'items', 'status_history'
        ]
        read_only_fields = ['ordered_on', 'otp']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # Generate OTP (you might want to implement your own logic)
        validated_data['otp'] = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        order = Orders.objects.create(**validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItems.objects.create(order=order, **item_data)
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            status=OrderStatus.PENDING
        )
        
        return order