from django.urls import path
from .views import SignupView, LoginView, ClientDetailView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('<uuid:client_id>/', ClientDetailView.as_view(), name='client-detail'),
]
