from django.urls import path
from .views import ServiceProviderViewSet,verify_faces,LoginView,SignupView,SubServiceProvidersViewSet,ProviderServicesViewSet

urlpatterns = [
    path('', 
        ServiceProviderViewSet.as_view({
            'get': 'list',
            'post': 'create'
        }), 
        name='provider-list'
    ),
    
    path('<uuid:id>/', 
        ServiceProviderViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }), 
        name='provider-detail'
    ),
    
    # Provider's Services URLs
   path('provider_services/', 
        ProviderServicesViewSet.as_view({
            'get': 'list'
        }), 
        name='provider-services'
    ),
    
    # Add multiple services to provider
    path('<uuid:id>/add-services/', 
        ServiceProviderViewSet.as_view({
            'post': 'add_services'
        }), 
        name='provider-add-services'
    ),
    
    # Remove multiple services from provider
    path('<uuid:id>/remove-services/', 
        ServiceProviderViewSet.as_view({
            'post': 'remove_services'
        }), 
        name='provider-remove-services'
    ),
    path('<uuid:subservice_id>/providers/',
        SubServiceProvidersViewSet.as_view({
            'get': 'list'
        }),
        name='subservice-providers'
    ),
    path('verify/', verify_faces, name='verify-faces'),
    path('login/', LoginView.as_view(), name='provider-login'),
    path('signup/', SignupView.as_view(), name='provider-signup'),
]