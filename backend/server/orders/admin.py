from django.contrib import admin
from .models import Orders, OrderItems, OrderStatusHistory

@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'provider', 'service', 'status', 'ordered_on', 'scheduled_on', 'total_price')
    list_filter = ('status', 'ordered_on', 'scheduled_on')
    search_fields = ('id', 'user__name', 'provider__name', 'service__name')  
    ordering = ('-ordered_on',)
    readonly_fields = ('id', 'ordered_on')

@admin.register(OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'subservice', 'price')
    list_filter = ('subservice',)
    search_fields = ('id', 'order__id', 'subservice__name')  
    ordering = ('order',)

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'status', 'changed_on')
    list_filter = ('status', 'changed_on')
    search_fields = ('id', 'order__id', 'status')
    ordering = ('-changed_on',)
from django.contrib import admin
from .models import Orders, OrderItems, OrderStatusHistory

@admin.register(Orders)
class OrdersAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'provider', 'service', 'status', 'ordered_on', 'scheduled_on', 'total_price')
    list_filter = ('status', 'ordered_on', 'scheduled_on')
    search_fields = ('id', 'user__name', 'provider__name', 'service__name')  
    ordering = ('-ordered_on',)
    readonly_fields = ('id', 'ordered_on')

@admin.register(OrderItems)
class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'subservice', 'price')
    list_filter = ('subservice',)
    search_fields = ('id', 'order__id', 'subservice__name')  
    ordering = ('order',)

@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'status', 'changed_on')
    list_filter = ('status', 'changed_on')
    search_fields = ('id', 'order__id', 'status')
    ordering = ('-changed_on',)
