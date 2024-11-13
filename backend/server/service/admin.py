# services/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.db.models import Count
from django.contrib.admin import SimpleListFilter
from .models import Service

class ServiceStatusFilter(SimpleListFilter):
    title = _('service status')
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return (
            ('with_providers', _('Has Providers')),
            ('no_providers', _('No Providers')),
            ('with_sub_services', _('Has Sub-services')),
            ('no_sub_services', _('No Sub-services')),
        )

    def queryset(self, request, queryset):
        if self.value() == 'with_providers':
            return queryset.filter(sub_services__providers__isnull=False).distinct()
        if self.value() == 'no_providers':
            return queryset.exclude(sub_services__providers__isnull=False).distinct()
        if self.value() == 'with_sub_services':
            return queryset.filter(sub_services__isnull=False).distinct()
        if self.value() == 'no_sub_services':
            return queryset.filter(sub_services__isnull=True)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        'image_preview', 'name', 'id', 'sub_services_count', 
        'providers_count', 'created_at'
    )
    list_display_links = ('image_preview', 'name')
    readonly_fields = ('id', 'image_preview_large', 'created_at', 'updated_at', 
                      'sub_services_count', 'providers_count')
    search_fields = ('name', 'id')
    list_filter = (ServiceStatusFilter, 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    ordering = ('name',)

    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'name')
        }),
        (_('Media'), {
            'fields': ('image', 'image_preview_large'),
            'classes': ('collapse',)
        }),
        (_('Service Statistics'), {
            'fields': ('sub_services_count', 'providers_count')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.annotate(
            total_sub_services=Count('sub_services', distinct=True),
            total_providers=Count('sub_services__providers', distinct=True)
        )

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; '
                'border-radius: 5px;"/>', obj.image.url
            )
        return format_html(
            '<div style="width: 50px; height: 50px; border: 2px dashed #ccc; '
            'border-radius: 5px; display: flex; align-items: center; '
            'justify-content: center;">No Image</div>'
        )
    image_preview.short_description = _('Preview')

    def sub_services_count(self, obj):
        count = obj.total_sub_services
        if count > 0:
            url = reverse('admin:sub_service_subservice_changelist') + f'?main_service={obj.id}'
            return format_html('<a href="{}">{} services</a>', url, count)
        return '0 services'
    sub_services_count.short_description = _('Total Services')
    sub_services_count.admin_order_field = 'total_sub_services'

    def providers_count(self, obj):
        count = obj.total_providers
        if count > 0:
            url = reverse('admin:service_provider_serviceprovider_changelist') + f'?main_service={obj.id}'
            return format_html('<a href="{}">{} providers</a>', url, count)
        return '0 providers'
    providers_count.short_description = _('Providers')
    providers_count.admin_order_field = 'total_providers'

    def image_preview_large(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; '
                'object-fit: contain; border-radius: 8px;"/><br/>'
                '<small style="color: #666;">Image URL: {}</small>',
                obj.image.url, obj.image.url
            )
        return format_html(
            '<div style="width: 300px; height: 200px; border: 2px dashed #ccc; '
            'border-radius: 8px; display: flex; align-items: center; '
            'justify-content: center;">No Image Uploaded</div>'
        )
    image_preview_large.short_description = _('Image Preview')

    class Media:
        css = {
            'all': ('admin/css/custom_admin.css',)
        }