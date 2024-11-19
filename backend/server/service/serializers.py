from rest_framework import serializers
from .models import Service
from sub_service.models import SubService
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

class ServiceSerializer(serializers.ModelSerializer):
    sub_services_count = serializers.SerializerMethodField()
    providers_count = serializers.SerializerMethodField()
    image_base64 = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = ['id', 'name', 'image_base64', 'sub_services_count',
                 'providers_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_sub_services_count(self, obj):
        return obj.get_sub_services_count()

    def get_providers_count(self, obj):
        return obj.get_providers_count()

    def get_image_base64(self, obj):
        if obj.image:
            try:
                with obj.image.open('rb') as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    return f"data:image/{obj.image.name.split('.')[-1]};base64,{encoded_image}"
            except Exception:
                return None
        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return {
            'status': True,
            'message': 'Service data retrieved successfully',
            'data': data
        }


class SubServiceSerializer(serializers.ModelSerializer):
    main_service_name = serializers.CharField(source='main_service.name', read_only=True)
    providers_count = serializers.IntegerField(read_only=True)
    image = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = SubService
        fields = ['id', 'name', 'main_service', 'main_service_name', 'providers_count', 'image']
        read_only_fields = ['id', 'main_service_name', 'providers_count']
        
    def to_representation(self, instance):
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