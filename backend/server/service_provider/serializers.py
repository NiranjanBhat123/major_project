from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.hashers import make_password, check_password
from .models import ServiceProvider, ProviderService
from service.models import Service
from sub_service.models import SubService
from orders.models import Orders
from orders.models import OrderStatus
from orders.models import OrderStatusHistory
from django.core.files.base import ContentFile
import random
from django.db.models import Avg, Count, Case, When,F, Subquery, OuterRef
from django.db.models.functions import Coalesce

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
                _("This sub-service doesn't belong to your main service category.")
            )
        return value


class ServiceProviderCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,  # Changed to True since it's required for new providers
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,  # Changed to True to match password requirement
        style={'input_type': 'password'}
    )
    provider_services = ProviderServiceCreateSerializer(many=True, required=False)
    
    class Meta:
        model = ServiceProvider
        fields = [
            'email', 'password', 'confirm_password',
            'main_service', 'first_name', 'last_name', 
            'aadhaar', 'gender', 'mobile_number', 'photo', 
            'street_address', 'city', 'state', 'postal_code', 
            'latitude', 'longitude', 'provider_services', 
            'is_active'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if password != confirm_password:
            raise serializers.ValidationError({
                'confirm_password': _("Passwords don't match.")
            })
            
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password', None)
        provider_services_data = validated_data.pop('provider_services', [])

        provider = ServiceProvider.objects.create(**validated_data)

        for service_data in provider_services_data:
            ProviderService.objects.create(provider=provider, **service_data)

        return provider

    def update(self, instance, validated_data):
        validated_data.pop('confirm_password', None)
        password = validated_data.pop('password', None)
        provider_services_data = validated_data.pop('provider_services', [])
        
        if password:
            validated_data['password'] = make_password(password)
            
        # Update provider services if provided
        if provider_services_data:
            instance.provider_services.all().delete()
            for service_data in provider_services_data:
                ProviderService.objects.create(provider=instance, **service_data)
                
        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError(_("Both email and password are required."))
            
        try:
            provider = ServiceProvider.objects.get(email=email)
            
            if not provider.is_active:
                raise serializers.ValidationError(_("This account has been deactivated."))
                
            if not provider.password:
                raise serializers.ValidationError(_("Please set up your password first."))
                
            if not check_password(password, provider.password):
                raise serializers.ValidationError(_("Invalid email or password."))
                
            data['user'] = provider
            return data
            
        except ServiceProvider.DoesNotExist:
            raise serializers.ValidationError(_("Invalid email or password."))

            

class ProviderServiceSerializer(serializers.ModelSerializer):
    provider_id = serializers.UUIDField(source='provider.id', read_only=True)
    provider_name = serializers.CharField(source='provider.full_name', read_only=True)
    provider_address = serializers.CharField(source='provider.street_address', read_only=True)
    provider_photo = Base64ImageField(source='provider.photo', read_only=True)
    provider_mobile_number = serializers.CharField(source='provider.mobile_number', read_only=True)
    provider_is_active = serializers.BooleanField(source='provider.is_active', read_only=True)
    provider_rating = serializers.DecimalField(
        max_digits=3,
        decimal_places=2,
        read_only=True
    )
    rating_counts = serializers.DictField(read_only=True)
    provider_reviews = serializers.ListField(read_only=True)
    distance = serializers.FloatField(read_only=True)

    class Meta:
        model = ProviderService
        fields = [
            'id',
            'provider_id',
            'provider_name',
            'provider_address',
            'provider_photo',
            'provider_rating',
            'rating_counts',
            'provider_reviews',
            'provider_mobile_number',
            'provider_is_active',
            'price',
            'distance'
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Get all completed orders for this provider
        completed_orders = Orders.objects.filter(
            provider=instance.provider,
            status=OrderStatus.COMPLETED,
            rating__isnull=False
        )

        # Calculate average rating
        avg_rating = completed_orders.aggregate(
            avg_rating=Coalesce(Avg('rating'), 0.0)
        )['avg_rating']
        representation['provider_rating'] = round(float(avg_rating), 2)

        # Calculate rating counts for each star
        rating_counts = completed_orders.aggregate(
            one_star=Count(Case(When(rating=1, then=1))),
            two_star=Count(Case(When(rating=2, then=1))),
            three_star=Count(Case(When(rating=3, then=1))),
            four_star=Count(Case(When(rating=4, then=1))),
            five_star=Count(Case(When(rating=5, then=1)))
        )
        representation['rating_counts'] = {
            '1': rating_counts['one_star'],
            '2': rating_counts['two_star'],
            '3': rating_counts['three_star'],
            '4': rating_counts['four_star'],
            '5': rating_counts['five_star']
        }

        # Get reviews
        completion_date_subquery = OrderStatusHistory.objects.filter(
        order=OuterRef('pk'),
        status=OrderStatus.COMPLETED
        ).values('changed_on')[:1]

        reviews = completed_orders.exclude(review__isnull=True).exclude(review='').annotate(
            completion_date=Subquery(completion_date_subquery)
        ).values(
            'id',
            'rating',
            'review',
            'completion_date',
            'user__name'
        ).order_by('-completion_date')[:10]  # Get last 10 reviews

        representation['provider_reviews'] = [{
            'order_id': str(review['id']),
            'rating': review['rating'],
            'review': review['review'],
            'date': review['completion_date'],
            'client_name': review['user__name']
        } for review in reviews]

        # Handle distance
        if hasattr(instance, 'distance'):
            representation['distance'] = float(instance.distance)
        else:
            representation['distance'] = None

        return representation

            

    
class SimpleProviderServiceSerializer(serializers.ModelSerializer):
    sub_service_name = serializers.CharField(source='sub_service.name', read_only=True)
    
    class Meta:
        model = ProviderService
        fields = [
            'id',
            'sub_service_name',
            'price',
        ]
