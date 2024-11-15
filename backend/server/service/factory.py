# factories.py
import factory
from django.contrib.auth import get_user_model
from .models import Service
from PIL import Image
import io
from django.core.files.base import ContentFile

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f'user{n}@test.com')
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    is_active = True

class ServiceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Service
        django_get_or_create = ('name',)

    name = factory.Sequence(lambda n: f'Service {n}')
    
    @factory.post_generation
    def with_image(self, create, extracted, **kwargs):
        if not create or not extracted:
            return

        # Create a test image
        image = Image.new('RGB', (100, 100), color='red')
        img_io = io.BytesIO()
        image.save(img_io, format='JPEG')
        img_file = ContentFile(img_io.getvalue(), 'test.jpg')
        self.image = img_file
        self.save()