from django.contrib import messages
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
from django.urls import reverse
from django.utils.timezone import template_localtime
from jinja2 import Environment

from hackathon_site.utils import (
    is_registration_open,
    get_sign_in_interval,
    get_curr_sign_in_time,
)


# In testing, nothing in this file can be overwritten using the
# @patch or @override_settings decorators, because it is evaluated before
# the test methods. If you have tests that rely on these values, explicitly
# set them in the context of your views.


def environment(**options):
    env = Environment(**options)
    env.globals.update(
        {
            # Functions
            "static": staticfiles_storage.url,
            "url": reverse,
            "localtime": template_localtime,
            "is_registration_open": is_registration_open,
            "get_messages": messages.get_messages,
            "get_sign_in_interval": get_sign_in_interval,
            "get_curr_sign_in_time": get_curr_sign_in_time,
            # Variables
            "hackathon_name": settings.HACKATHON_NAME,
            "hss_url": settings.HSS_URL,
            "registration_open_date": settings.REGISTRATION_OPEN_DATE,
            "registration_close_date": settings.REGISTRATION_CLOSE_DATE,
            "event_start_date": settings.EVENT_START_DATE,
            "event_end_date": settings.EVENT_END_DATE,
            "waitlisted_acceptance_start_time": settings.WAITLISTED_ACCEPTANCE_START_TIME,
            "final_review_response_date": settings.FINAL_REVIEW_RESPONSE_DATE,
            "from_email": settings.DEFAULT_FROM_EMAIL,
            "contact_email": settings.CONTACT_EMAIL,
            "participant_package_link": settings.PARTICIPANT_PACKAGE_LINK,
            "chat_room_name": settings.CHAT_ROOM[0],
            "chat_room_link": settings.CHAT_ROOM[1],
            "using_teams": settings.TEAMS,
            "using_rsvp": settings.RSVP,
            "sign_in_times": settings.SIGN_IN_TIMES,
        }
    )
    return env
