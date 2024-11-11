import factory
from django.contrib.auth import get_user_model
from service.factory import ServiceFactory
from sub_service.factory import SubServiceFactory
from .models import ServiceProvider, ProviderService

User = get_user_model()

class ServiceProviderFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ServiceProvider

    first_name = factory.Sequence(lambda n: f"Provider {n}")
    last_name = factory.Sequence(lambda n: f"Last {n}")
    aadhaar = factory.Sequence(lambda n: f"{n:012}")
    gender = factory.Iterator(['M', 'F', 'O'])
    mobile_number = factory.Sequence(lambda n: f"{n:010}")
    photo = factory.django.ImageField(color='blue')
    street_address = factory.Sequence(lambda n: f"Street {n}")
    city = factory.Sequence(lambda n: f"City {n}")
    state = factory.Iterator([state[0] for state in ServiceProvider.STATE_CHOICES])
    postal_code = factory.Sequence(lambda n: f"{n:06}")
    latitude = factory.Faker('latitude')
    longitude = factory.Faker('longitude')
    main_service = factory.SubFactory(ServiceFactory)
    is_active = True

class ProviderServiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProviderService

    provider = factory.SubFactory(ServiceProviderFactory)
    sub_service = factory.SubFactory(SubServiceFactory, main_service=factory.SelfAttribute('..provider.main_service'))
    price = factory.Faker('pydecimal', left_digits=5, right_digits=2, positive=True)