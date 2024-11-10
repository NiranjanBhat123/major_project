from django.urls import path
from .views import ServiceViewSet, SubServiceViewSet

urlpatterns = [
    path('', ServiceViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='service-list'),
    path('<uuid:id>/', ServiceViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='service-detail'),
    path('<uuid:service_id>/subservices/',
         SubServiceViewSet.as_view({
             'get': 'list',
             'post': 'create'
         }),
         name='subservice-list'),

    path('<uuid:service_id>/subservices/<uuid:id>/',
         SubServiceViewSet.as_view({
             'get': 'retrieve',
             'put': 'update',
             'patch': 'partial_update',
             'delete': 'destroy'
         }),
         name='subservice-detail'),
]
