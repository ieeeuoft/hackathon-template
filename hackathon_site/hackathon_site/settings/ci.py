"""
Settings file for use in testing and CI environments.

Usage:
    ```
    python manage.py test --settings=hackathon_site.settings.ci
    ```

Changes the default database to use an in-memory sqlite3 database,
instead of the default postgresql database. This means that you
don't need to have access to a properly configured postgres server
to run tests (helpful in CI environments especially, though it is
possible to use a postgres image for GitHub actions), and tests
will be faster without the round-trips to the database.

The caveat is that there may be inconsistencies between sqlite and
postgres, that would pose an issue in production but will not be
caught during testing. These should be caught by a staging environment,
and by running your code before you merge it.
"""
from hackathon_site.settings import *

# Convenient for some methods to test, since DEBUG=0 in testing
IN_TESTING = True

DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": ":memory:"}}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "test-cache",
    }
}

# For testing, make the media root a local folder to avoid
# permissions errors
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

if not os.path.isdir(MEDIA_ROOT):
    os.makedirs(MEDIA_ROOT)

# In testing, captchas should always pass. These are special keys
# which will allow all verification requests to pass.
RECAPTCHA_PUBLIC_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
RECAPTCHA_PRIVATE_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"
SILENCED_SYSTEM_CHECKS = ["captcha.recaptcha_test_key_error"]
