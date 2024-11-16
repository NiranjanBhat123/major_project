from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from django.utils.html import format_html
from django.contrib.admin import SimpleListFilter
from .models import Client

class StateFilter(SimpleListFilter):
    title = _('State')
    parameter_name = 'state'

    def lookups(self, request, model_admin):
        states = Client.objects.values_list('state', flat=True).distinct().order_by('state')
        return [(state, state) for state in states]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(state=self.value())
        return queryset

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name',
        'email',
        'mobile_number',
        'location_display',
        'address_display',
        'created_at'
    ]
    
    list_filter = [
        StateFilter,
        'city',
        'created_at'
    ]
    
    search_fields = [
        'name',
        'email',
        'mobile_number',
        'street_address',
        'city',
        'state',
        'postal_code'
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
        'map_preview'
    ]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': (
                'id',
                'name',
                'email',
                ('password', 'mobile_number')
            )
        }),
        (_('Address Information'), {
            'fields': (
                'street_address',
                ('city', 'state'),
                'postal_code',
                ('latitude', 'longitude'),
                'map_preview'
            )
        }),
        (_('System Information'), {
            'fields': (
                'created_at',
                'updated_at'
            ),
            'classes': ('collapse',)
        })
    )
    
    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:  # If editing existing object
            form.base_fields['password'].required = False
        return form
    
    def location_display(self, obj):
        return format_html(
            '<span title="Lat: {}, Long: {}">📍 View Location</span>',
            obj.latitude,
            obj.longitude
        )
    location_display.short_description = _('Location')
    
    def address_display(self, obj):
        return format_html(
            '<div style="max-width: 300px; white-space: normal;">{}</div>',
            obj.get_full_address()
        )
    address_display.short_description = _('Address')
    
    def map_preview(self, obj):
        if obj and obj.latitude and obj.longitude:
            return format_html(
                '''
                <div style="margin-top: 10px;">
                    <a href="https://www.openstreetmap.org/?mlat={}&mlon={}&zoom=15" 
                       target="_blank" 
                       class="button" 
                       style="padding: 5px 10px; background-color: #447e9b; color: white; 
                              text-decoration: none; border-radius: 4px;">
                        🗺️ View on Map
                    </a>
                </div>
                ''',
                obj.latitude,
                obj.longitude
            )
        return _("Location coordinates not set")
    map_preview.short_description = _('Map Preview')

    def save_model(self, request, obj, form, change):
        """Only hash password if it's been changed"""
        if form.cleaned_data.get('password') == '':
            # If password field is empty in admin form, use existing password
            if obj.pk:
                orig_obj = Client.objects.get(pk=obj.pk)
                obj.password = orig_obj.password
        super().save_model(request, obj, form, change)
        
    class Media:
        css = {
            'all': ('admin/css/custom.css',)
        }