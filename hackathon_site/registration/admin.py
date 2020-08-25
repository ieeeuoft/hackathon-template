from django.contrib import admin
from .models import Application, Team as TeamApplied

# Register your models here.
admin.site.register(Application)
admin.site.register(TeamApplied)
