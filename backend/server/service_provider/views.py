from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.http import Http404
from django.db import transaction
from .models import ServiceProvider, ProviderService, SubService
from .serializers import (
    ServiceProviderListSerializer,
    ServiceProviderDetailSerializer,
    ServiceProviderCreateUpdateSerializer,
    ProviderServiceSerializer,
    ProviderServiceCreateSerializer
)
from server.pagination import CustomPagination

class ServiceProviderViewSet(viewsets.ModelViewSet):
    queryset = ServiceProvider.objects.all()
    pagination_class = CustomPagination
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceProviderListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ServiceProviderCreateUpdateSerializer
        return ServiceProviderDetailSerializer

    @action(detail=True, methods=['get'])
    def services(self, request, id=None):
        try:
            provider = self.get_object()
            if isinstance(provider, Response):
                return provider
                
            provider_services = provider.provider_services.all()
            serializer = ProviderServiceSerializer(provider_services, many=True)
            return Response({
                'status': True,
                'message': 'Provider services retrieved successfully',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': False,
                'message': str(e),
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def add_services(self, request, id=None):
        try:
            provider = self.get_object()
            if isinstance(provider, Response):
                return provider

            services_data = request.data.get('services', [])
            if not isinstance(services_data, list):
                return Response({
                    'status': False,
                    'message': 'Services data must be an array',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            created_services = []
            errors = []

            with transaction.atomic():
                for service_data in services_data:
                    try:
                        # Validate that the sub-service belongs to provider's main service
                        sub_service = get_object_or_404(
                            SubService, 
                            id=service_data.get('sub_service')
                        )
                        
                        if sub_service.main_service != provider.main_service:
                            errors.append({
                                'sub_service': service_data.get('sub_service'),
                                'error': 'Sub-service must belong to provider\'s main service category'
                            })
                            continue

                        # Check if service already exists
                        if ProviderService.objects.filter(
                            provider=provider,
                            sub_service=sub_service
                        ).exists():
                            errors.append({
                                'sub_service': service_data.get('sub_service'),
                                'error': 'Service already exists for this provider'
                            })
                            continue

                        serializer = ProviderServiceCreateSerializer(
                            data=service_data,
                            context={'provider': provider}
                        )
                        serializer.is_valid(raise_exception=True)
                        provider_service = serializer.save(provider=provider)
                        created_services.append(provider_service)

                    except Exception as e:
                        errors.append({
                            'sub_service': service_data.get('sub_service'),
                            'error': str(e)
                        })

            if not created_services and errors:
                return Response({
                    'status': False,
                    'message': 'No services were added',
                    'errors': errors,
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            response_serializer = ProviderServiceSerializer(created_services, many=True)
            return Response({
                'status': True,
                'message': f'{len(created_services)} services added successfully',
                'errors': errors if errors else None,
                'data': response_serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'status': False,
                'message': str(e),
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def remove_services(self, request, id=None):
        try:
            provider = self.get_object()
            if isinstance(provider, Response):
                return provider

            service_ids = request.data.get('service_ids', [])
            if not isinstance(service_ids, list):
                return Response({
                    'status': False,
                    'message': 'Service IDs must be an array',
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            deleted_count = 0
            errors = []

            with transaction.atomic():
                for service_id in service_ids:
                    try:
                        service = ProviderService.objects.get(
                            provider=provider,
                            id=service_id
                        )
                        service.delete()
                        deleted_count += 1
                    except ProviderService.DoesNotExist:
                        errors.append({
                            'service_id': service_id,
                            'error': 'Service not found'
                        })

            if not deleted_count and errors:
                return Response({
                    'status': False,
                    'message': 'No services were deleted',
                    'errors': errors,
                    'data': None
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'status': True,
                'message': f'{deleted_count} services removed successfully',
                'errors': errors if errors else None,
                'data': {
                    'deleted_count': deleted_count,
                    'service_ids': service_ids
                }
            })

        except Exception as e:
            return Response({
                'status': False,
                'message': str(e),
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)