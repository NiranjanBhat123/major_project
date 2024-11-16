# views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import ClientSerializer, LoginSerializer
from .models import Client
from django.views.decorators.csrf import csrf_exempt


class SignupView(APIView):
    """
    View for user signup. Handles creating a new user (Client).
    """
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new client instance to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    View for user login. Handles generating a token for the user.
    """
    @csrf_exempt
    def post(self, request):
        print(request.data)
        serializer = LoginSerializer(data=request.data)
        
        # Validate the data with the serializer
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # Generate JWT tokens (refresh and access tokens)
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Send the tokens in response
            return Response({
                'access_token': access_token,
                'refresh_token': refresh_token,
                # 'user_id': user.id,
                # 'email': user.email,
                # 'name': user.name,  # Include any other fields you want in the response
            }, status=status.HTTP_200_OK)
        
        # If data is invalid, send back errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)