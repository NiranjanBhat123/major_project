# Django imports
from django.conf import settings
from django.core.exceptions import ValidationError
from django.http import Http404
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

# Third-party imports
import os
import cv2
import numpy as np
from PIL import Image
from deepface import DeepFace

# DRF imports
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

# Models
from .models import ServiceProvider, ProviderService, SubService

# Serializers
from .serializers import (
    ServiceProviderListSerializer,
    ServiceProviderDetailSerializer,
    ServiceProviderCreateUpdateSerializer,
    ProviderServiceSerializer,
    ProviderServiceCreateSerializer,
    LoginSerializer
)

# Pagination
from server.pagination import CustomPagination

# Utilities
from .validate_service_provider import FaceMatcher

# Database
from django.db import transaction




@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
@permission_classes([AllowAny])
def verify_faces(request):
    image1 = request.FILES.get('image1')
    image2 = request.FILES.get('image2')

    if not image1 or not image2:
        return Response({"success": False, "error": "Both images are required."}, status=400)

    matcher = FaceMatcher()

    try:
        # Save the uploaded images to the 'images' folder in the project directory
        images_dir = os.path.join(settings.BASE_DIR, 'images')
        os.makedirs(images_dir, exist_ok=True)

        img1_path = os.path.join('images', image1.name)
        img2_path = os.path.join('images', image2.name)

        with open(os.path.join(images_dir, image1.name), 'wb+') as destination:
            for chunk in image1.chunks():
                destination.write(chunk)

        with open(os.path.join(images_dir, image2.name), 'wb+') as destination:
            for chunk in image2.chunks():
                destination.write(chunk)
                
        result = matcher.verify_faces(img1_path, img2_path)
        print(result)
        os.remove(os.path.join(images_dir, image1.name))
        os.remove(os.path.join(images_dir, image2.name))




    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=400)

    return Response(result)




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
            
            
class SignupView(APIView):
    """View for service provider signup."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ServiceProviderCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            provider = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(provider)
            
            return Response({
                'status': True,
                'message': 'Service provider registered successfully',
                'data': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'provider_id': str(provider.id),
                    'email': provider.email,
                    'name': provider.full_name
                }
            }, status=status.HTTP_201_CREATED)
            
        return Response({
            'status': False,
            'message': 'Registration failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """View for service provider login."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            provider = serializer.validated_data['user']
            refresh = RefreshToken.for_user(provider)
            
            return Response({
                'status': True,
                'message': 'Login successful',
                'data': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'provider_id': str(provider.id),
                    'email': provider.email,
                    'name': provider.full_name
                }
            }, status=status.HTTP_200_OK)
            
        return Response({
            'status': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)