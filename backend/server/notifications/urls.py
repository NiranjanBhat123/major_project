from django.urls import path
from .views import NotificationViewSet

urlpatterns = [
    path('', NotificationViewSet.as_view(), name='notifications'),
    path('<uuid:notification_id>/', NotificationViewSet.as_view(), name='notification-update'),
]