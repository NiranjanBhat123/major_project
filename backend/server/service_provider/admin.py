from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.db.models import Count, Q
from .models import ServiceProvider, ProviderService

admin.site.site_header = "FixNGo Admin"
admin.site.site_title = "FixNGo Admin Portal"
admin.site.index_title = "Welcome to FixNGo Admin Portal"

class ProviderServiceInline(admin.TabularInline):
    model = ProviderService
    extra = 1
    fields = ('sub_service', 'price')
    readonly_fields = ('created_at',)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "sub_service" and request._obj is not None:
            kwargs["queryset"] = db_field.related_model.objects.filter(
                main_service=request._obj.main_service
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(ServiceProvider)
class ServiceProviderAdmin(admin.ModelAdmin):
    list_display = (
        'photo_preview', 'full_name', 'email', 'main_service', 
        'mobile_number', 'city', 'state', 'is_active'
    )
    list_display_links = ('photo_preview', 'full_name')
    search_fields = (
        'first_name', 'last_name', 'email', 
        'mobile_number', 'aadhaar'
    )
    list_filter = ('main_service', 'city', 'state', 'gender', 'is_active', 'created_at')
    inlines = [ProviderServiceInline]
    readonly_fields = ('id', 'photo_preview_large', 'created_at', 'updated_at')

    fieldsets = (
        (_('Authentication'), {
            'fields': ('email', 'password')
        }),
        (_('Service Information'), {
            'fields': ('main_service', 'is_active')
        }),
        (_('Personal Information'), {
            'fields': (
                'id', 'first_name', 'last_name', 'gender', 'aadhaar', 'mobile_number'
            )
        }),
        (_('Media'), {
            'fields': ('photo', 'photo_preview_large'),
            'classes': ('collapse',)
        }),
        (_('Location Information'), {
            'fields': (
                'street_address', 'city', 'state', 'postal_code',
                'latitude', 'longitude'
            )
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Rest of the methods remain the same
    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if obj:  # If editing existing object
            # Remove password field from fieldsets when editing
            auth_fields = fieldsets[0][1]['fields']
            if 'password' in auth_fields:
                fieldsets[0][1]['fields'] = tuple(
                    f for f in auth_fields if f != 'password'
                )
        return fieldsets

    def get_queryset(self, request):
        return super().get_queryset(request)
        
    def get_search_results(self, request, queryset, search_term):
        queryset, may_have_duplicates = super().get_search_results(
            request, queryset, search_term
        )
        filters = request.GET.dict()
        if 'main_service' in filters:
            queryset = queryset.filter(main_service_id=filters['main_service'])
        return queryset, may_have_duplicates

    def get_form(self, request, obj=None, **kwargs):
        request._obj = obj
        return super().get_form(request, obj, **kwargs)

    def photo_preview(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; '
                'border-radius: 25px;"/>', obj.photo.url
            )
        return format_html(
            '<div style="width: 50px; height: 50px; border: 2px dashed #ccc; '
            'border-radius: 25px; display: flex; align-items: center; '
            'justify-content: center;">No Photo</div>'
        )
    photo_preview.short_description = _('Photo')

    def photo_preview_large(self, obj):
        if obj.photo:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; '
                'object-fit: contain; border-radius: 8px;"/><br/>'
                '<small style="color: #666;">Photo URL: {}</small>',
                obj.photo.url, obj.photo.url
            )
        return format_html(
            '<div style="width: 300px; height: 200px; border: 2px dashed #ccc; '
            'border-radius: 8px; display: flex; align-items: center; '
            'justify-content: center;">No Photo Uploaded</div>'
        )
    photo_preview_large.short_description = _('Photo Preview')

@admin.register(ProviderService)
class ProviderServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'provider', 'sub_service', 'price', 'created_at')
    list_filter = ('created_at', 'provider__main_service')
    search_fields = ('provider__first_name', 'provider__last_name', 'sub_service__name')
    autocomplete_fields = ['provider', 'sub_service']
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('provider', 'sub_service')
