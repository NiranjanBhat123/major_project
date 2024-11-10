# tests.py

from expects import *
from expects.matchers import Matcher
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from PIL import Image
import io
import uuid
import random
import string
from .factory import UserFactory, ServiceFactory
from .models import Service

# Custom matchers
class have_status_code(Matcher):
    def __init__(self, expected):
        self.expected = expected

    def _match(self, subject):
        return subject.status_code == self.expected, []

class be_uuid(Matcher):
    def _match(self, subject):
        try:
            uuid.UUID(str(subject))
            return True, []
        except ValueError:
            return False, ["Expected value to be a valid UUID"]

@pytest.mark.django_db
class TestServiceModel:
    def test_service_creation(self):
        service = ServiceFactory()
        expect(service).to(be_truthy)
        expect(service.id).to(be_uuid())
        expect(service.name).to(start_with('Service'))

    def test_service_str_representation(self):
        service = ServiceFactory(name="Test Service")
        expect(str(service)).to(equal("Test Service"))

    def test_service_name_validation(self):
        # Test minimum length
        with pytest.raises(Exception) as exc_info:
            ServiceFactory(name="a")
        expect(str(exc_info.value)).to(contain("at least 2 characters"))

        # Test maximum length
        long_name = "".join(random.choices(string.ascii_letters, k=101))
        with pytest.raises(Exception) as exc_info:
            ServiceFactory(name=long_name)
        expect(str(exc_info.value)).to(contain("cannot exceed 100 characters"))

    def test_service_image_validation(self):
        # Create an image larger than 2MB
        large_image = Image.new('RGB', (2000, 2000), color='red')
        img_io = io.BytesIO()
        large_image.save(img_io, format='JPEG', quality=100)
        img_file = ContentFile(img_io.getvalue(), 'large.jpg')
        
        service = ServiceFactory()
        with pytest.raises(Exception) as exc_info:
            service.image = img_file
            service.full_clean()
        expect(str(exc_info.value)).to(contain("Maximum file size allowed is 2MB"))

@pytest.mark.django_db
class TestServiceViewSet(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)
        self.base_url = reverse('service-list')

    def test_create_service_success(self):
        data = {'name': 'New Service'}
        response = self.client.post(self.base_url, data)
        expect(response).to(have_status_code(status.HTTP_201_CREATED))
        expect(response.data).to(have_key('status', True))
        expect(response.data).to(have_key('message', 'Service created successfully'))
        expect(response.data['data']).to(have_key('name', 'New Service'))

    def test_create_service_duplicate_name(self):
        ServiceFactory(name="Existing Service")
        data = {'name': 'Existing Service'}
        response = self.client.post(self.base_url, data)
        expect(response).to(have_status_code(status.HTTP_409_CONFLICT))
        expected_response = {
            "status": False,
            "message": "A service with this name already exists",
            "data": None
        }
        expect(response.data).to(equal(expected_response))

    def test_list_services_pagination(self):
        # Create 25 services in batch
        ServiceFactory.create_batch(25)
        
        response = self.client.get(self.base_url)
        expect(response).to(have_status_code(status.HTTP_200_OK))
        expect(response.data['data']).to(have_key('count', 25))
        expect(response.data['data']['results']).to(have_len(10))  # First page
        
        # Test second page
        next_page = response.data['data']['next']
        response = self.client.get(next_page)
        expect(response).to(have_status_code(status.HTTP_200_OK))
        expect(response.data['data']['results']).to(have_len(10))  # Second page

    def test_retrieve_nonexistent_service(self):
        url = reverse('service-detail', kwargs={'id': uuid.uuid4()})
        response = self.client.get(url)
        expect(response).to(have_status_code(status.HTTP_404_NOT_FOUND))
        expected_response = {
            "detail": "No Service matches the given query."
        }
        expect(response.data).to(equal(expected_response))

    def test_update_service(self):
        service = ServiceFactory()
        url = reverse('service-detail', kwargs={'id': service.id})
        data = {'name': 'Updated Service'}
        response = self.client.put(url, data)
        expect(response).to(have_status_code(status.HTTP_200_OK))
        expect(response.data['data']['name']).to(equal('Updated Service'))

    def test_update_nonexistent_service(self):
        url = reverse('service-detail', kwargs={'id': uuid.uuid4()})
        data = {'name': 'Updated Service'}
        response = self.client.put(url, data)
        expect(response).to(have_status_code(status.HTTP_404_NOT_FOUND))
        expected_response = {
            "detail": "No Service matches the given query."
        }
        expect(response.data).to(equal(expected_response))

    def test_delete_service(self):
        service = ServiceFactory()
        url = reverse('service-detail', kwargs={'id': service.id})
        response = self.client.delete(url)
        expect(response).to(have_status_code(status.HTTP_204_NO_CONTENT))

    def test_delete_nonexistent_service(self):
        url = reverse('service-detail', kwargs={'id': uuid.uuid4()})
        response = self.client.delete(url)
        expect(response).to(have_status_code(status.HTTP_404_NOT_FOUND))
        expected_response = {
            "detail": "No Service matches the given query."
        }
        expect(response.data).to(equal(expected_response))

    def test_authentication_required(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.base_url)
        expect(response).to(have_status_code(status.HTTP_401_UNAUTHORIZED))

    @pytest.mark.django_db
    def test_service_with_image(self):
        image = Image.new('RGB', (100, 100), color='red')
        img_io = io.BytesIO()
        image.save(img_io, format='JPEG')
        img_file = SimpleUploadedFile(
            "test.jpg", 
            img_io.getvalue(), 
            content_type="image/jpeg"
        )

        data = {
            'name': 'Service with Image',
            'image': img_file
        }
        response = self.client.post(
            self.base_url, 
            data,
            format='multipart'
        )
        expect(response).to(have_status_code(status.HTTP_201_CREATED))

@pytest.mark.django_db
class TestServicePerformance:
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

    def test_bulk_service_listing_performance(self):
        # Create 100 services in batch for performance testing
        ServiceFactory.create_batch(100)
        
        # Test response time for first page
        import time
        start_time = time.time()
        response = self.client.get(reverse('service-list'))
        end_time = time.time()
        
        expect(response).to(have_status_code(status.HTTP_200_OK))
        expect(end_time - start_time).to(be_below(1.0))  # Response should be under 1 second