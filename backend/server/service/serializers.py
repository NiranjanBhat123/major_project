from rest_framework import serializers
from .models import Service
from sub_service.models import SubService


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


class SubServiceSerializer(serializers.ModelSerializer):
    main_service_name = serializers.CharField(source='main_service.name', read_only=True)
    providers_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = SubService
        fields = ['id', 'name', 'main_service', 'main_service_name', 'providers_count']
        read_only_fields = ['id', 'main_service_name', 'providers_count']

    def to_representation(self, instance):
        # Return direct data without wrapping in status/message
        return super().to_representation(instance)

    def get_providers_count(self, obj):
        return obj.providers.count()

    def validate_name(self, value):
        main_service = self.context.get('main_service')
        if main_service and SubService.objects.filter(
            name__iexact=value,
            main_service=main_service
        ).exists():
            raise serializers.ValidationError(
                "A sub-service with this name already exists under this service"
            )
        return value