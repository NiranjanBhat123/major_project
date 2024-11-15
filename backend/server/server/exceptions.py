from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import (
    APIException,
    ValidationError,
    NotFound,
    PermissionDenied,
    AuthenticationFailed,
    NotAuthenticated
)
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db.utils import OperationalError

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework that provides consistent
    error responses across applications.
    
    Args:
        exc: The exception object
        context: The exception context
    
    Returns:
        Response object with standardized error format
    """
    response = drf_exception_handler(exc, context)

    if response is None:
        if isinstance(exc, ObjectDoesNotExist):
            return Response({
                'status': False,
                'message': 'Resource not found',
                'data': None
            }, status=status.HTTP_404_NOT_FOUND)

        elif isinstance(exc, IntegrityError):
            error_message = str(exc)
            if 'unique constraint' in error_message.lower():
                return Response({
                    'status': False,
                    'message': 'Resource with this identifier already exists',
                    'data': None
                }, status=status.HTTP_409_CONFLICT)
            
            return Response({
                'status': False,
                'message': 'Database integrity error',
                'data': None
            }, status=status.HTTP_400_BAD_REQUEST)

        elif isinstance(exc, OperationalError):
            return Response({
                'status': False,
                'message': 'Database operation failed',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        else:
            return Response({
                'status': False,
                'message': 'Internal server error',
                'data': None
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Handle DRF-specific exceptions
    if isinstance(exc, ValidationError):
        if isinstance(response.data, dict):
            first_field = next(iter(response.data))
            error_message = f"Invalid {first_field}"
            if 'required' in str(response.data[first_field][0]).lower():
                error_message = f"Missing {first_field}"
        else:
            error_message = "Validation error"

        response.data = {
            'status': False,
            'message': error_message,
            'data': None
        }

    elif isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        response.data = {
            'status': False,
            'message': 'Authentication required',
            'data': None
        }

    elif isinstance(exc, NotFound):
        response.data = {
            'status': False,
            'message': 'Resource not found',
            'data': None
        }

    elif isinstance(exc, PermissionDenied):
        response.data = {
            'status': False,
            'message': 'Permission denied',
            'data': None
        }

    return response