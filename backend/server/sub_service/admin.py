# sub_service/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _
from django.urls import reverse
from django.db.models import Count, Avg,Q
from .models import SubService

@admin.register(SubService)
class SubServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'main_service', 'providers_count', 'avg_price')
    list_filter = ('main_service', 'created_at')
    search_fields = ('name', 'main_service__name')
    readonly_fields = ('id', 'created_at', 'updated_at', 'providers_count', 'avg_price')
    ordering = ('main_service', 'name')
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('id', 'name', 'main_service')
        }),
        (_('Statistics'), {
            'fields': ('providers_count', 'avg_price')
        }),
        (_('Timestamps'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            total_providers=Count('provider_services__provider', distinct=True,
                                filter=Q(provider_services__provider__is_active=True)),
            average_price=Avg('provider_services__price',
                            filter=Q(provider_services__provider__is_active=True))
        )

    def providers_count(self, obj):
        count = obj.providers.count()
        if count > 0:
            url = reverse('admin:service_provider_serviceprovider_changelist') + f'?main_service={obj.main_service.id}'
            return format_html('<a href="{}">{} providers</a>', url, count)
        return '0 providers'
    providers_count.short_description = _('Providers')
    providers_count.admin_order_field = 'total_providers'


    def avg_price(self, obj):
        avg = getattr(obj, 'average_price', 0)
        if avg:
            return f'₹{avg:.2f}'
        return 'N/A'
    avg_price.short_description = _('Average Price')
    avg_price.admin_order_field = 'average_price'