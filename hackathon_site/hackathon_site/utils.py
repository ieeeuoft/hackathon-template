from datetime import datetime
from dateutil import tz
from sys import platform


from django.conf import settings


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


def formatDateTime(datetime, format):
    """
    Format a datetime using strftime. 
    """
    local_zone = tz.tzlocal()
    # Replaces incompatible identifiers.
    # Add to this function if there are any datetime format issues
    if platform == "win32":
        finalFormat = format.replace("%-d", "%#d")
    else:
        finalFormat = format.replace("%#d", "%-d")
    retVal = datetime.astimezone(local_zone).strftime(finalFormat)
    return retVal
