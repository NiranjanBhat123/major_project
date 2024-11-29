from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from .models import Orders, OrderItems, OrderStatusHistory

class OrderItemsInline(admin.TabularInline):
    model = OrderItems
    extra = 1
    readonly_fields = ('id',)
    raw_id_fields = ('provider_service',)
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "provider_service" and request.resolver_match.kwargs.get('object_id'):
            order = Orders.objects.get(pk=request.resolver_match.kwargs['object_id'])
            kwargs["queryset"] = order.provider.provider_services.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('id', 'changed_on')
    can_delete = False
    
    def has_add_permission(self, request, obj=None):
        return False

@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'user', 
        'provider', 
        'service', 
        'scheduled_on', 
        'status', 
        'total_price',
        'rating_display'
    )
    list_filter = (
        'status', 
        'service', 
        'scheduled_on',
        'provider__main_service',
        ('rating', admin.EmptyFieldListFilter),
    )
    search_fields = (
        'id', 
        'user__name', 
        'provider__first_name', 
        'provider__last_name',
        'service__name'
    )
    readonly_fields = ('id', 'ordered_on')
    raw_id_fields = ('user', 'provider', 'service')
    inlines = [OrderItemsInline, OrderStatusHistoryInline]
    fieldsets = (
        (_('Basic Information'), {
            'fields': (('id', 'user'), ('provider', 'service'))
        }),
        (_('Order Details'), {
            'fields': (('ordered_on', 'scheduled_on'), ('otp', 'status', 'total_price'),('client_latitude','client_longitude'))
        }),
        (_('Feedback'), {
            'fields': ('review', 'rating'),
            'classes': ('collapse',)
        })
    )
    
    def rating_display(self, obj):
        if obj.rating:
            stars = '★' * obj.rating + '☆' * (5 - obj.rating)
            return format_html(
                '<span style="color: #FFD700;">{}</span>',
                stars
            )
        return '-'
    rating_display.short_description = _('Rating')

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ('user', 'provider', 'service')
        return self.readonly_fields

    def save_model(self, request, obj, form, change):
        """Create status history entry when status changes"""
        if change:
            old_obj = self.model.objects.get(pk=obj.pk)
            if old_obj.status != obj.status:
                OrderStatusHistory.objects.create(
                    order=obj,
                    status=obj.status
                )
        super().save_model(request, obj, form, change)

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "service" and request._obj is not None:
            kwargs["queryset"] = db_field.related_model.objects.filter(
                id=request._obj.provider.main_service.id
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_form(self, request, obj=None, **kwargs):
        request._obj = obj
        return super().get_form(request, obj, **kwargs)

@admin.register(OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'get_provider_service')
    list_filter = ('order__status', 'provider_service__sub_service__main_service')
    search_fields = (
        'id', 
        'order__id', 
        'provider_service__sub_service__name',
        'provider_service__provider__first_name',
        'provider_service__provider__last_name'
    )
    readonly_fields = ('id',)
    raw_id_fields = ('order', 'provider_service')

    def get_provider_service(self, obj):
        return f"{obj.provider_service.sub_service.name} by {obj.provider_service.provider.full_name}"
    get_provider_service.short_description = _('Provider Service')
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "provider_service" and request._obj is not None:
            kwargs["queryset"] = db_field.related_model.objects.filter(
                provider=request._obj.order.provider
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def get_form(self, request, obj=None, **kwargs):
        request._obj = obj
        return super().get_form(request, obj, **kwargs)

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'status', 'changed_on')
    search_fields = ('id', 'order__id', 'status')
    list_filter = ('status', 'changed_on')
    readonly_fields = ('id', 'changed_on')

    actions = ['delete_all']

    def delete_all(self, request, queryset):
        queryset.delete()
        self.message_user(request, "All selected status history entries have been deleted.")
    delete_all.short_description = "Delete All Selected Status History"
    
    
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False