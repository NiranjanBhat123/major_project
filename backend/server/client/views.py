# views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientSerializer, LoginSerializer
from .models import Client
from django.views.decorators.csrf import csrf_exempt


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientSerializer, LoginSerializer
from .models import Client


class SignupView(APIView):
    """
    View for user signup. Handles creating a new user (Client) and returns tokens.
    """
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new client instance
            client = serializer.save()
            
            # Generate tokens for the new client
            refresh = RefreshToken.for_user(client)
            
            # Prepare response data
            response_data = {
                'tokens': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'user': {
                    'id': str(client.id),  # Convert UUID to string
                    'email': client.email,
                    'name': client.name,
                }
            }
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    View for user login. Returns authentication tokens and user details.
    """
    @csrf_exempt
    def post(self, request):
        print(request.data)
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            # Prepare response data
            response_data = {
                'tokens': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'user': {
                    'id': str(user.id),  # Convert UUID to string
                    'email': user.email,
                    'name': user.name,
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
