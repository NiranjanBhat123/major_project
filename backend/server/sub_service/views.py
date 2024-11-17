from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .models import SubService
from .serializers import SubServiceSerializer

class SubServiceListView(generics.ListAPIView):
    """
    API view to list all subservices
    """
    queryset = SubService.objects.all()
    serializer_class = SubServiceSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        response_data = {
            "status": True,
            "message": "Data retrieved successfully",
            "data": {
                "count": queryset.count(),
                "next": None,
                "previous": None,
                "results": serializer.data
            }
        }
        return Response(response_data, status=status.HTTP_200_OK)