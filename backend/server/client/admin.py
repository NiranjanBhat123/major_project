from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import Client
from django.contrib.auth.hashers import make_password

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'email',
        'mobile_number',
        'city',
        'state',
        'postal_code',
        'created_at',
        'updated_at'
    )
    
    list_filter = (
        'city',
        'state',
        'created_at',
        'updated_at'
    )
    
    search_fields = (
        'name',
        'email',
        'mobile_number',
        'street_address',
        'city',
        'state',
        'postal_code'
    )
    
    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )
    
    fieldsets = (
        (_('Personal Information'), {
            'fields': ('id', 'name', 'email', 'mobile_number')
        }),
        (_('Address Information'), {
            'fields': (
                'street_address',
                'city',
                'state',
                'postal_code',
                'latitude',
                'longitude'
            )
        }),
        (_('Security'), {
            'fields': ('password',),
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    ordering = ('-created_at',)
    list_per_page = 25
    date_hierarchy = 'created_at'

    def save_model(self, request, obj, form, change):
        """
        Override save_model to handle password hashing when saving from admin
        """
        if 'password' in form.changed_data:  # Only hash if password has changed
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)

    def get_readonly_fields(self, request, obj=None):
        """
        Make certain fields readonly only when editing existing objects
        """
        if obj:  # editing an existing object
            return self.readonly_fields + ('password',)
        return self.readonly_fields
    
    def get_fieldsets(self, request, obj=None):
        """
        Customize fieldsets based on whether adding or editing
        """
        fieldsets = super().get_fieldsets(request, obj)
        if not obj:  # Adding new client
            # Remove 'id' from personal information fieldset for new clients
            personal_info = list(fieldsets[0][1]['fields'])
            if 'id' in personal_info:
                personal_info.remove('id')
            fieldsets[0][1]['fields'] = tuple(personal_info)
        return fieldsets