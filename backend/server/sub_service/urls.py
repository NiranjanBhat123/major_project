from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubServiceViewSet

router = DefaultRouter()
router.register(r'sub-services', SubServiceViewSet, basename='sub-service')

urlpatterns = [
    path('', include(router.urls)),
]