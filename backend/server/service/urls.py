from django.urls import path
from .views import ServiceViewSet

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
    path('<uuid:id>/statistics/', ServiceViewSet.as_view({
        'get': 'statistics'
    }), name='service-statistics'),
]