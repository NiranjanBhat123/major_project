from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubServiceListView

# router = DefaultRouter()
# router.register(r'sub-services', SubServiceViewSet, basename='sub-service')

urlpatterns = [
    path('listAll/', SubServiceListView.as_view(), name='subservice-list'),
   
]