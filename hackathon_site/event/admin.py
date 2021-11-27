from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Profile, Team as TeamEvent

# class UserAdminModel(UserAdmin):
#     list_display = UserAdmin.list_display + ("is_active",)

# Register your models here.
admin.site.register(TeamEvent)
admin.site.register(Profile)
# admin.site.register(UserAdminModel)
