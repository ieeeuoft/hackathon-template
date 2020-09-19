"""hackathon_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import url
from django.conf import settings

from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from registration.views import ResumeView

schema_view = get_schema_view(
    openapi.Info(
        title="Hardware Hackathon API",
        default_version="v1",
        description="API Endpoint Visualization for Hardware Hackathon",
    ),
    public=bool(settings.DEBUG),
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls", namespace="api")),
    url(
        r"^swagger/$",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path("registration/", include("registration.urls", namespace="registration")),
]

if not settings.MEDIA_URL.startswith("http"):
    urlpatterns += [
        path(
            "%s/applications/resumes/<str:filename>" % settings.MEDIA_URL.strip("/"),
            ResumeView.as_view(),
            name="resume",
        ),
    ]


if settings.DEBUG:
    import debug_toolbar
    from django.core.exceptions import ImproperlyConfigured
    from django.urls import re_path
    from django.views.static import serve

    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]

    if settings.MEDIA_URL.startswith("http"):
        raise ImproperlyConfigured(
            "To serve media from off-site in development, "
            "remove the media path from hackathon_site.urls"
        )
    urlpatterns += [
        re_path(
            r"^%s/(?P<path>.*)$" % settings.MEDIA_URL.strip("/"),
            serve,
            {"document_root": settings.MEDIA_ROOT},
        )
    ]

# Catchall for event urls at the end of the url routes
urlpatterns += [path("", include("event.urls", namespace="event"))]
