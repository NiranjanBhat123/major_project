from rest_framework import serializers
from .models import Client
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError


class ClientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=5)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'password', 'mobile_number', 'street_address',
            'city', 'state', 'postal_code'
        ]
        read_only_fields = ['id']  # Make id read-only
    
    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def validate_email(self, value):
        """Ensure that email is unique."""
        if Client.objects.filter(email=value).exists():
            raise ValidationError("This email address is already in use.")
        return value

    def validate_mobile_number(self, value):
        """Ensure that mobile number is exactly 10 digits and unique."""
        if not value.isdigit() or len(value) != 10:
            raise ValidationError("Mobile number must be exactly 10 digits.")
        if Client.objects.filter(mobile_number=value).exists():
            raise ValidationError("This mobile number is already in use.")
        return value

    def validate_postal_code(self, value):
        """Ensure that postal code is exactly 6 digits."""
        if not value.isdigit() or len(value) != 6:
            raise ValidationError("Postal code must be exactly 6 digits.")
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        try:
            client = Client.objects.get(email=email)
        except Client.DoesNotExist:
            raise serializers.ValidationError({
                "email": ["A user with this email does not exist."]
            })

        if not check_password(password, client.password):
            raise serializers.ValidationError({
                "password": ["Incorrect password."]
            })

        data['user'] = client
        return data