from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from .models import Service
from .serializers import ServiceSerializer
from server.pagination import CustomPagination

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = CustomPagination
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = Service.objects.annotate(
            sub_services_count=Count('sub_services', distinct=True),
            providers_count=Count('sub_services__providers', distinct=True)
        )
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset.order_by('name')

    def create(self, request, *args, **kwargs):
        try:
            # First check if a service with the same name exists
            name = request.data.get('name')
            if name and Service.objects.filter(name__iexact=name).exists():
                return Response({
                    'status': False,
                    'message': 'A service with this name already exists',
                    'data': None
                }, status=status.HTTP_409_CONFLICT)

            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': True,
                    'message': 'Service created successfully',
                    'data': serializer.data['data']
                }, status=status.HTTP_201_CREATED)
            
            # Get the first validation error field
            first_field = next(iter(serializer.errors))
            error_message = f"Missing {first_field}" if 'required' in str(serializer.errors[first_field][0]) else f"Invalid {first_field}"
            
            return Response({
                'status': False,
                'message': error_message,
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'status': False,
                'message': 'Failed to create service',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            name = request.data.get('name')
            
            # Check for existing service with same name, excluding current instance
            if name and Service.objects.filter(name__iexact=name).exclude(id=instance.id).exists():
                return Response({
                    'status': False,
                    'message': 'A service with this name already exists',
                    'data': None
                }, status=status.HTTP_409_CONFLICT)

            serializer = self.get_serializer(instance, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'status': True,
                    'message': 'Service updated successfully',
                    'data': serializer.data['data']
                }, status=status.HTTP_200_OK)
            
            # Get the first validation error field
            first_field = next(iter(serializer.errors))
            error_message = f"Missing {first_field}" if 'required' in str(serializer.errors[first_field][0]) else f"Invalid {first_field}"
            
            return Response({
                'status': False,
                'message': error_message,
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except ObjectDoesNotExist:
            return Response({
                'status': False,
                'message': 'Service not found',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)