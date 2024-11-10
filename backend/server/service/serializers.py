from rest_framework import serializers
from .models import Service
from server.serializers import CommonResponseSerializer

class ServiceSerializer(serializers.ModelSerializer):
    sub_services_count = serializers.SerializerMethodField()
    providers_count = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'image', 'image_url', 'sub_services_count', 
                 'providers_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_sub_services_count(self, obj):
        return obj.get_sub_services_count()

    def get_providers_count(self, obj):
        return obj.get_providers_count()

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def validate_image(self, value):
        if value and value.size > 2 * 1024 * 1024:  # 2MB
            raise serializers.ValidationError("Image size cannot exceed 2MB")
        return value

    def to_representation(self, instance):
        # Get the base representation
        data = super().to_representation(instance)
        # Wrap it in a single layer with status and message
        return {
            'status': True,
            'message': 'Service data retrieved successfully',
            'data': data
        }