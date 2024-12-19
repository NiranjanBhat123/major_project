from rest_framework import serializers
from .models import Client
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError

class ClientSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=5)
    full_address = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'email', 'mobile_number', 
            'street_address', 'city', 'state', 'postal_code', 
            'latitude', 'longitude', 'full_address','password',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def get_full_address(self, obj):
        return obj.get_full_address()

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


class ClientDetailSerializer(ClientSerializer):
    class Meta(ClientSerializer.Meta):
        extra_kwargs = {
            'name': {'required': False},
            'mobile_number': {'required': False},
            'street_address': {'required': False},
            'city': {'required': False},
            'state': {'required': False},
            'postal_code': {'required': False}
        }

    def validate_mobile_number(self, value):
        """
        Ensure that mobile number is exactly 10 digits and unique,
        allowing the current user's existing number.
        """
        if not value.isdigit() or len(value) != 10:
            raise ValidationError("Mobile number must be exactly 10 digits.")
        
        # Check if the mobile number is already in use by another user
        existing_clients = Client.objects.filter(mobile_number=value)
        
        # If this is a partial update (editing an existing user)
        if self.instance:
            # Exclude the current user's record from the uniqueness check
            existing_clients = existing_clients.exclude(id=self.instance.id)
        
        if existing_clients.exists():
            raise ValidationError("This mobile number is already in use.")
        
        return value
