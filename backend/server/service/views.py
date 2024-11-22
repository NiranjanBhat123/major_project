from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Count
from server.exceptions import (
    ObjectDoesNotExist,
    ValidationError,
    IntegrityError,
    OperationalError
)
from .models import Service
from sub_service.models import SubService
from .serializers import ServiceSerializer, SubServiceSerializer
from server.pagination import CustomPagination
import uuid

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = CustomPagination
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
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
        name = request.data.get('name')
        if name and Service.objects.filter(name__iexact=name).exists():
            raise IntegrityError('A service with this name already exists')

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Service created successfully',
            'data': serializer.data['data']
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        name = request.data.get('name')
        
        if name and Service.objects.filter(name__iexact=name).exclude(id=instance.id).exists():
            raise IntegrityError('A service with this name already exists')

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Service updated successfully',
            'data': serializer.data['data']
        }, status=status.HTTP_200_OK)

class SubServiceViewSet(viewsets.ModelViewSet):
    serializer_class = SubServiceSerializer
    pagination_class = CustomPagination
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    lookup_field = 'id'

    def get_queryset(self):
        service_id = self.kwargs.get('service_id')
        queryset = SubService.objects.filter(main_service_id=service_id).annotate(
            providers_count=Count('providers', distinct=True)
        )
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        
        return queryset.order_by('name')

    def get_main_service(self):
        try:
            service_id = self.kwargs.get('service_id')
            return Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            raise ObjectDoesNotExist('Service not found')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'status': True,
                'message': 'Data retrieved successfully',
                'data': {
                    'count': self.paginator.page.paginator.count,
                    'next': self.paginator.get_next_link(),
                    'previous': self.paginator.get_previous_link(),
                    'results': serializer.data
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': True,
            'message': 'Data retrieved successfully',
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        main_service = self.get_main_service()
        name = request.data.get('name')
        
        if name and SubService.objects.filter(
            main_service=main_service,
            name__iexact=name
        ).exists():
            raise IntegrityError('A sub-service with this name already exists under this service')
        
        mutable_data = request.data.copy()
        mutable_data['main_service'] = main_service.id
        
        serializer = self.get_serializer(
            data=mutable_data,
            context={'main_service': main_service}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Sub-service created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        main_service = self.get_main_service()
        name = request.data.get('name')
        
        if name and SubService.objects.filter(
            main_service=main_service,
            name__iexact=name
        ).exclude(id=instance.id).exists():
            raise IntegrityError('A sub-service with this name already exists under this service')
        
        mutable_data = request.data.copy()
        mutable_data['main_service'] = main_service.id
        
        serializer = self.get_serializer(
            instance,
            data=mutable_data,
            context={'main_service': main_service}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Sub-service updated successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'status': True,
            'message': 'Sub-service deleted successfully',
            'data': None
        }, status=status.HTTP_200_OK)
    
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Count
from server.exceptions import (
    ObjectDoesNotExist,
    ValidationError,
    IntegrityError,
    OperationalError
)
from .models import Service
from sub_service.models import SubService
from .serializers import ServiceSerializer, SubServiceSerializer
from server.pagination import CustomPagination
import uuid

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = CustomPagination
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
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
        name = request.data.get('name')
        if name and Service.objects.filter(name__iexact=name).exists():
            raise IntegrityError('A service with this name already exists')

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Service created successfully',
            'data': serializer.data['data']
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        name = request.data.get('name')
        
        if name and Service.objects.filter(name__iexact=name).exclude(id=instance.id).exists():
            raise IntegrityError('A service with this name already exists')

        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Service updated successfully',
            'data': serializer.data['data']
        }, status=status.HTTP_200_OK)

class SubServiceViewSet(viewsets.ModelViewSet):
    serializer_class = SubServiceSerializer
    pagination_class = CustomPagination
    permission_classes = [AllowAny]
    authentication_classes = [JWTAuthentication]
    lookup_field = 'id'

    def get_queryset(self):
        service_id = self.kwargs.get('service_id')
        queryset = SubService.objects.filter(main_service_id=service_id).annotate(
            providers_count=Count('providers', distinct=True)
        )
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        
        return queryset.order_by('name')

    def get_main_service(self):
        try:
            service_id = self.kwargs.get('service_id')
            return Service.objects.get(id=service_id)
        except Service.DoesNotExist:
            raise ObjectDoesNotExist('Service not found')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'status': True,
                'message': 'Data retrieved successfully',
                'data': {
                    'count': self.paginator.page.paginator.count,
                    'next': self.paginator.get_next_link(),
                    'previous': self.paginator.get_previous_link(),
                    'results': serializer.data
                }
            })

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'status': True,
            'message': 'Data retrieved successfully',
            'data': serializer.data
        })

    def create(self, request, *args, **kwargs):
        main_service = self.get_main_service()
        name = request.data.get('name')
        
        if name and SubService.objects.filter(
            main_service=main_service,
            name__iexact=name
        ).exists():
            raise IntegrityError('A sub-service with this name already exists under this service')
        
        mutable_data = request.data.copy()
        mutable_data['main_service'] = main_service.id
        
        serializer = self.get_serializer(
            data=mutable_data,
            context={'main_service': main_service}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Sub-service created successfully',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        main_service = self.get_main_service()
        name = request.data.get('name')
        
        if name and SubService.objects.filter(
            main_service=main_service,
            name__iexact=name
        ).exclude(id=instance.id).exists():
            raise IntegrityError('A sub-service with this name already exists under this service')
        
        mutable_data = request.data.copy()
        mutable_data['main_service'] = main_service.id
        
        serializer = self.get_serializer(
            instance,
            data=mutable_data,
            context={'main_service': main_service}
        )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'status': True,
            'message': 'Sub-service updated successfully',
            'data': serializer.data
        }, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'status': True,
            'message': 'Sub-service deleted successfully',
            'data': None
        }, status=status.HTTP_200_OK)