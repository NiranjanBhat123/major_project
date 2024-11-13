import factory
from faker import Faker
from sub_service.models import SubService
from service.factory import ServiceFactory  # Import existing ServiceFactory

fake = Faker()

class SubServiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SubService

    name = factory.Sequence(lambda n: f'SubService {n}')
    main_service = factory.SubFactory(ServiceFactory)
