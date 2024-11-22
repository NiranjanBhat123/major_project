from rest_framework import serializers
from .models import SubService

class SubServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for SubService model - converts model instances to JSON format
    """
    class Meta:
        model = SubService
        fields = ['id', 'name', 'main_service']