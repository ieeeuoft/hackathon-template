from pathlib import Path

from django.conf import settings
from django.contrib.auth.models import Permission
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin


class ResumeViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()

        # Create a sample file on disk
        file = Path(settings.MEDIA_ROOT, "applications", "resumes", "my_resume.txt")
        if not file.parent.exists():
            # Make the folder on disk if necessary
            file.parent.mkdir(parents=True)
        file.write_bytes(b"I enjoy doing things")

        self.url = reverse("resume", kwargs={"filename": "my_resume.txt"})

    def _login_with_permissions(self):
        permission = Permission.objects.get(
            content_type__app_label="registration", codename="view_application"
        )
        self.user.user_permissions.add(permission)
        self._login()

    def test_requires_login(self):
        response = self.client.get(self.url)
        self.assertRedirects(response, f"{settings.LOGIN_URL}?next={self.url}")

    def test_requires_permission(self):
        self._login()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_file_not_found(self):
        self._login_with_permissions()
        response = self.client.get(
            reverse("resume", kwargs={"filename": "does-not-exist.txt"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_response_found(self):
        self._login_with_permissions()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.get("Content-Type"), "text/plain")
