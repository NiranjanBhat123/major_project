from django.urls import path
from .views import OrderCreateListView, OrderStatusUpdateView,OrderReviewUpdateView


urlpatterns = [
    # Create order and list orders (filtered by client_id or provider_id)
    path('', OrderCreateListView.as_view(), name='order-create-list'),
    
    # Update order status
    path('<uuid:order_id>/status/', OrderStatusUpdateView.as_view(), name='order-status-update'),
     path('<uuid:order_id>/review/', OrderReviewUpdateView.as_view(), name='order-review-update'),
]