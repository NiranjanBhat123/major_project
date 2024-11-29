from rest_framework import serializers
from .models import Orders, OrderItems, OrderStatusHistory,OrderStatus
import random

# class OrderItemSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = OrderItems
#         fields = ['id', 'provider_service']


from django.core.files.base import ContentFile

import base64

class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            # Get the base64 data after the comma
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            
            # Convert base64 to file
            data = ContentFile(base64.b64decode(imgstr), name=f'temp.{ext}')
        
        return super().to_internal_value(data)
    
    def to_representation(self, value):
        if not value:
            return None
        
        try:
            with value.open('rb') as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode()
                return f'data:image/{value.name.split(".")[-1]};base64,{encoded_string}'
        except Exception:
            return None


class OrderItemSerializer(serializers.ModelSerializer):
    sub_service_name = serializers.CharField(source='provider_service.sub_service.name', read_only=True)
    price = serializers.DecimalField(source='provider_service.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItems
        fields = ['id', 'provider_service', 'sub_service_name', 'price']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'changed_on']
        read_only_fields = ['changed_on']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_image = serializers.SerializerMethodField()

    class Meta:
        model = Orders
        fields = [
            'id', 'user', 'provider', 'provider_name', 'service', 'service_name', 'service_image',
            'ordered_on', 'scheduled_on', 'otp', 'status', 'total_price', 
            'review', 'rating', 'items', 'status_history','client_latitude','client_longitude'
        ]
        read_only_fields = ['ordered_on', 'otp']

    def get_service_image(self, obj):
        if obj.service.image:
            try:
                with obj.service.image.open('rb') as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    return f"data:image/{obj.service.image.name.split('.')[-1]};base64,{encoded_image}"
            except Exception:
                return None
        return None
    
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