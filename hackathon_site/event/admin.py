from django.contrib import admin
from .models import Profile, Team as TeamEvent

# Register your models here.
admin.site.register(TeamEvent)
admin.site.register(Profile)
