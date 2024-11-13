from rest_framework import serializers
from .models import ServiceProvider, ProviderService
from service.models import Service
from sub_service.models import SubService

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'name']

class SubServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubService
        fields = ['id', 'name']

class ProviderServiceSerializer(serializers.ModelSerializer):
    sub_service = SubServiceSerializer()
    
    class Meta:
        model = ProviderService
        fields = ['id', 'sub_service', 'price']

class ServiceProviderListSerializer(serializers.ModelSerializer):
    main_service = ServiceSerializer()
    sub_services = SubServiceSerializer(many=True)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'gender',
            'mobile_number', 'city', 'state', 'main_service',
            'sub_services', 'is_active'
        ]

class ServiceProviderDetailSerializer(serializers.ModelSerializer):
    main_service = ServiceSerializer()
    provider_services = ProviderServiceSerializer(many=True)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'gender',
            'mobile_number', 'photo', 'street_address', 'city', 'state',
            'postal_code', 'latitude', 'longitude', 'main_service',
            'provider_services', 'is_active', 'created_at', 'updated_at'
        ]

class ProviderServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderService
        fields = ['sub_service', 'price']

    def validate_sub_service(self, value):
        provider = self.context['provider']
        if value.main_service != provider.main_service:
            raise serializers.ValidationError(
                "This sub-service doesn't belong to your main service category."
            )
        return value

class ServiceProviderCreateUpdateSerializer(serializers.ModelSerializer):
    provider_services = ProviderServiceCreateSerializer(many=True, required=False)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'main_service', 'first_name', 'last_name', 'aadhaar',
            'gender', 'mobile_number', 'photo', 'street_address',
            'city', 'state', 'postal_code', 'latitude', 'longitude',
            'provider_services', 'is_active'
        ]

    def create(self, validated_data):
        provider_services_data = validated_data.pop('provider_services', [])
        provider = ServiceProvider.objects.create(**validated_data)
        
        for service_data in provider_services_data:
            ProviderService.objects.create(provider=provider, **service_data)
        
        return provider

    def update(self, instance, validated_data):
        provider_services_data = validated_data.pop('provider_services', None)
        
        # Update ServiceProvider fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update ProviderServices if provided
        if provider_services_data is not None:
            instance.provider_services.all().delete()
            for service_data in provider_services_data:
                ProviderService.objects.create(provider=instance, **service_data)
        
        return instance
