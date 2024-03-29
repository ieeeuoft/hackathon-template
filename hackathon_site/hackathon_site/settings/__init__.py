"""
Django settings for hackathon_site project.

Generated by 'django-admin startproject' using Django 3.0.5.

Currently running Django 3.1

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""

from datetime import datetime, timedelta
import os
from pathlib import Path
import pytz

from django.urls import reverse_lazy

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = Path(__file__).resolve(strict=True).parent.parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ["SECRET_KEY"]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(int(os.environ.get("DEBUG", 0)))

IN_TESTING = False  # Overwritten by hackathon_site.settings.ci

if DEBUG:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]
    INTERNAL_IPS = ["localhost", "127.0.0.1"]
    CORS_ORIGIN_REGEX_WHITELIST = [
        r"^https?://localhost:?\d*$",
    ]
    EMAIL_BACKEND = "django.core.mail.backends.filebased.EmailBackend"
    HSS_URL = "http://localhost:3000/"
else:
    # NOTE: If you aren't ieee uoft, put your websites here
    ALLOWED_HOSTS = ["ieee.utoronto.ca"]
    CORS_ORIGIN_REGEX_WHITELIST = [
        r"^https://ieee\.utoronto.ca:?\d*$",
    ]
    HSS_URL = "https://hardware.newhacks.ca/"

CORS_ALLOW_CREDENTIALS = True

RECAPTCHA_DOMAIN = "www.recaptcha.net"

RECAPTCHA_TEST_PUBLIC_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
RECAPTCHA_TEST_PRIVATE_KEY = "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"

if DEBUG or IN_TESTING:
    # These are special keys which will always allow requests to pass
    # verification
    RECAPTCHA_PUBLIC_KEY = RECAPTCHA_TEST_PUBLIC_KEY
    RECAPTCHA_PRIVATE_KEY = RECAPTCHA_TEST_PRIVATE_KEY
    SILENCED_SYSTEM_CHECKS = ["captcha.recaptcha_test_key_error"]
else:
    # If the default test keys are used, the captcha package will create a system
    # check warning.
    RECAPTCHA_PUBLIC_KEY = os.environ.get(
        "RECAPTCHA_PUBLIC_KEY", RECAPTCHA_TEST_PUBLIC_KEY
    )
    RECAPTCHA_PRIVATE_KEY = os.environ.get(
        "RECAPTCHA_PRIVATE_KEY", RECAPTCHA_TEST_PRIVATE_KEY
    )

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.forms",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework.authtoken",
    "dj_rest_auth",
    "drf_yasg",
    "import_export",
    "django_filters",
    "client_side_image_cropping",
    "captcha",
    "dashboard",
    "registration",
    "event",
    "hardware",
    "review",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if DEBUG:
    INSTALLED_APPS += ["debug_toolbar"]
    MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

ROOT_URLCONF = "hackathon_site.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.jinja2.Jinja2",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"environment": "hackathon_site.jinja2.environment"},
    },
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    },
]

FORM_RENDERER = "django.forms.renderers.TemplatesSetting"

WSGI_APPLICATION = "hackathon_site.wsgi.application"

LOGIN_URL = reverse_lazy("event:login")
LOGIN_REDIRECT_URL = reverse_lazy("event:dashboard")
LOGOUT_REDIRECT_URL = reverse_lazy("event:index")


# Database
# https://docs.djangoproject.com/en/3.0/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "hackathon_site"),
        "USER": os.environ.get("DB_USER", "postgres"),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""),
        "HOST": os.environ.get("DB_HOST", "127.0.0.1"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"

# Cache
# https://docs.djangoproject.com/en/3.1/topics/cache/
REDIS_URI = os.environ.get("REDIS_URI", "172.17.0.1:6379/1")
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": f"redis://{REDIS_URI}",
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient",},
        # Default time for cache key expiry, in seconds. Can be changed on a per-key basis
        "TIMEOUT": 600,
    }
}

# Password validation
# https://docs.djangoproject.com/en/3.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "PAGE_SIZE": 100,
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend",],
}

# Internationalization
# https://docs.djangoproject.com/en/3.0/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "America/Toronto"
TZ_INFO = pytz.timezone(TIME_ZONE)

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Swagger
# https://drf-yasg.readthedocs.io/en/stable/settings.html
SWAGGER_SETTINGS = {"DEFAULT_MODEL_RENDERING": "example", "DEEP_LINKING": True}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.0/howto/static-files/

# Per this patch, this will be prepended with SCRIPT_NAME in production
# https://github.com/django/django/pull/11564
STATIC_URL = "static/"

STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_URL = "media/"

if DEBUG:
    MEDIA_ROOT = os.path.join(BASE_DIR, "media")

    if not os.path.isdir(MEDIA_ROOT):
        os.makedirs(MEDIA_ROOT)

    EMAIL_FILE_PATH = os.path.join(BASE_DIR, "emails")

    if not os.path.isdir(EMAIL_FILE_PATH):
        os.makedirs(EMAIL_FILE_PATH)
else:
    # You will almost certainly want to change this
    # Remember to create this folder on your server
    MEDIA_ROOT = "/var/www/media/"

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_false": {"()": "django.utils.log.RequireDebugFalse",},
        "require_debug_true": {"()": "django.utils.log.RequireDebugTrue",},
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "filters": ["require_debug_true"],
        },
        "console_errors": {
            "level": "ERROR",
            "class": "logging.StreamHandler",
            "filters": ["require_debug_false"],
        },
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "console_errors", "mail_admins"],
            "level": "INFO",
            "propagate": True,
        },
        "django.request": {
            "handlers": ["console", "console_errors"],
            "propagate": False,
        },
        "review": {"handlers": ["console", "console_errors"], "propagate": False},
        "hardware": {
            "handlers": ["console", "console_errors", "mail_admins"],
            "level": "ERROR",
            "propagate": False,
        },
    },
}

# Event specific settings
HACKATHON_NAME = "CoolHacks"
DEFAULT_FROM_EMAIL = "webmaster@localhost"
CONTACT_EMAIL = DEFAULT_FROM_EMAIL
HSS_ADMIN_EMAIL = "hardware@newhacks.ca"

REGISTRATION_OPEN_DATE = datetime(2020, 9, 1, tzinfo=TZ_INFO)
REGISTRATION_CLOSE_DATE = datetime(2023, 9, 30, tzinfo=TZ_INFO)
EVENT_START_DATE = datetime(2023, 10, 10, 10, 0, 0, tzinfo=TZ_INFO)
EVENT_END_DATE = datetime(2023, 10, 11, 17, 0, 0, tzinfo=TZ_INFO)
HARDWARE_SIGN_OUT_START_DATE = datetime(2020, 9, 1, tzinfo=TZ_INFO)
HARDWARE_SIGN_OUT_END_DATE = datetime(2024, 9, 30, tzinfo=TZ_INFO)

# Registration user requirements
MINIMUM_AGE = 14

# Registration settings
ACCOUNT_ACTIVATION_DAYS = 7
RSVP_DAYS = 7

# Team requirements
MIN_MEMBERS = 2
MAX_MEMBERS = 4

# The time at which waitlisted people will start being accepted into
# the event. This usually happens an hour or two after the start of
# the event.
WAITLISTED_ACCEPTANCE_START_TIME = EVENT_START_DATE + timedelta(hours=1)

# The date at which applications will be reviewed at the latest.
FINAL_REVIEW_RESPONSE_DATE = REGISTRATION_CLOSE_DATE + timedelta(days=7)

# Links
PARTICIPANT_PACKAGE_LINK = "#"

# Note this is in the form (chat_room_name, chat_room_link)
# Chat room name is such as the following: Slack, Discord
CHAT_ROOM = ("Slack", "https://slack.com")

# Enable/Disable certain Features
TEAMS = True
RSVP = True

# HSS Testing
TEST_USER_GROUP = "HSS Test Users"
