from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from expects import expect, equal, have_keys, contain, be, have_len
from .factory import ServiceProviderFactory, ProviderServiceFactory
from sub_service.factory import SubServiceFactory
from service.factory import ServiceFactory, UserFactory


class TestServiceProviderViewSet(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)

        self.service_provider = ServiceProviderFactory()
        self.sub_service = SubServiceFactory(main_service=self.service_provider.main_service)
        self.provider_service = ProviderServiceFactory(provider=self.service_provider, sub_service=self.sub_service)

    def test_list_service_providers(self):
        url = reverse('provider-list')
        response = self.client.get(url)
        expect(response.status_code).to(equal(200))
    
    
    def test_list_service_providers_batch(self):
        # Create multiple service providers
        ServiceProviderFactory.create_batch(10)
        url = reverse('provider-list')
        response = self.client.get(url)
        expect(response.status_code).to(equal(200))

    def test_retrieve_service_provider(self):
        url = reverse('provider-detail', args=[self.service_provider.id])
        response = self.client.get(url)
        expect(response.status_code).to(equal(200))
        expect(response.data).to(have_keys(
            'id', 'first_name', 'last_name', 'full_name', 'gender',
            'mobile_number', 'photo', 'street_address', 'city', 'state',
            'postal_code', 'latitude', 'longitude', 'main_service',
            'provider_services', 'is_active', 'created_at', 'updated_at'
        ))
        expect(response.data['provider_services']).to(have_len(1))
        expect(response.data['provider_services'][0]).to(have_keys(
            'id', 'sub_service', 'price'
        ))

    def test_remove_services_from_provider(self):
        url = reverse('provider-remove-services', args=[self.service_provider.id])
        data = {
            'service_ids': [self.provider_service.id]
        }
        response = self.client.post(url, data, format='json')
        expect(response.status_code).to(equal(200))
        expect(response.data['data']['deleted_count']).to(equal(1))
        expect(response.data['data']['service_ids']).to(contain(self.provider_service.id))

    def test_remove_services_from_provider_with_invalid_id(self):
        url = reverse('provider-remove-services', args=[self.service_provider.id])
        data = {
            'service_ids': [999]
        }
        response = self.client.post(url, data, format='json')
        expect(response.status_code).to(equal(400))
        expect(response.data['errors']).to(have_len(1))
        expect(response.data['errors'][0]['error']).to(equal('Service not found'))

    def test_unauthenticated_access(self):
        self.client.force_authenticate(user=None)
        url = reverse('provider-list')
        response = self.client.get(url)
        expect(response.status_code).to(equal(401))