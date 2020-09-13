from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.urls import reverse
from django.utils.timezone import template_localtime

from jinja2 import Environment


def environment(**options):
    env = Environment(**options)
    env.globals.update(
        {
            # Functions
            "static": staticfiles_storage.url,
            "url": reverse,
            "localtime": template_localtime,
            # Variables
            "event_name": settings.HACKATHON_NAME,
            "registration_open_date": settings.REGISTRATION_OPEN_DATE,
            "registration_close_date": settings.REGISTRATION_CLOSE_DATE,
            "registration_open": settings.REGISTRATION_OPEN,
            "event_start_date": settings.EVENT_START_DATE,
            "event_end_date": settings.EVENT_END_DATE,
            "from_email": settings.DEFAULT_FROM_EMAIL,
            "contact_email": settings.CONTACT_EMAIL,
        }
    )
    return env
