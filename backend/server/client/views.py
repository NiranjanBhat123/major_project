from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientSerializer, LoginSerializer, ClientDetailSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from client.models import Client

class SignupView(APIView):
    """
    View for user signup. Handles creating a new user (Client) and returns tokens.
    """
    def post(self, request):
        print(request.data)
        serializer = ClientSerializer(data=request.data)

        if serializer.is_valid():
            client = serializer.save()
            
            refresh = RefreshToken.for_user(client)
            
            response_data = {
                'tokens': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'user': {
                    'id': str(client.id),
                    'email': client.email,
                    'name': client.name,
                }
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    View for user login. Returns authentication tokens and user details.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'tokens': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.name,
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ClientDetailView(generics.RetrieveAPIView, generics.UpdateAPIView):
    """
    API endpoint to retrieve and partially update client details by ID.
    Requires authentication.
    """
    serializer_class = ClientDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    lookup_url_kwarg = 'client_id'
    queryset = Client.objects.all()

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve method to handle potential not found scenarios.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Client.DoesNotExist:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, *args, **kwargs):
        """
        Handle partial update of client details.
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            
            if serializer.is_valid():
                self.perform_update(serializer)
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Client.DoesNotExist:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        