from datetime import datetime

from dateutil.relativedelta import relativedelta
from django.conf import settings


class NoEventOccurringException(Exception):
    def __init__(self):
        super().__init__(
            "There is currently no event happening for the user to sign in."
        )


def is_registration_open():
    """
    Determine whether registration is currently open
    """
    if settings.IN_TESTING:
        # So tests don't rely on the date, default to true
        return True

    # datetime.now() returns the system native time, so this assumes that the system timezone
    # is configured to match TIME_ZONE. We then make the datetime object timezone-aware.
    now = datetime.now().replace(tzinfo=settings.TZ_INFO)
    return settings.REGISTRATION_OPEN_DATE <= now < settings.REGISTRATION_CLOSE_DATE


def is_hackathon_happening():
    if settings.IN_TESTING or settings.DEBUG:
        return True

    now = datetime.now().replace(tzinfo=settings.TZ_INFO)
    return settings.EVENT_START_DATE <= now < settings.EVENT_END_DATE


def get_curr_sign_in_time(useDescription=False):
    now = datetime.now().replace(tzinfo=settings.TZ_INFO)
    for event in settings.SIGN_IN_TIMES:
        start_interval = event["time"] - relativedelta(hours=1)
        end_interval = event["time"] + relativedelta(hours=1)
        if start_interval <= now <= end_interval:
            return event["description"] if useDescription else event["name"]

    if useDescription:
        return None
    raise NoEventOccurringException()


# assumes interval won't overlap between different months or years
def get_sign_in_interval(time):
    start_interval = time - relativedelta(hours=1)
    end_interval = time + relativedelta(hours=1)

    if start_interval.day == end_interval.day:
        return f"{start_interval.strftime('%H:%M')} - {end_interval.strftime('%H:%M')}, {start_interval.strftime('%b %d')}"

    return f"{start_interval.strftime('%H:%M, %b %d')} - {end_interval.strftime('%H:%M, %b %d')}"
