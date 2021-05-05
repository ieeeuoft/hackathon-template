import csv
import io

from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.admin import ApplicationAdmin


class ExportCsvAdminTestCase(SetupUserMixin, TestCase):
    """
    Test that CSV exportation in the Registration/Application tab works as expected.
    """

    def setUp(self):
        super().setUp()
        self.application_view = reverse("admin:registration_application_changelist")
        self.export_fields = [field[0] for field in ApplicationAdmin.export_fields]

        self.user.is_staff = True
        self.user.save()

        self.team1 = self._make_full_registration_team(self_users=False)
        self.team2 = self._make_full_registration_team(self_users=False)

        self.data = {
            "action": "export_as_csv",
            "_selected_action": [i.id for i in self.team1.applications.all()],
        }

    def test_permission_denied(self):
        self._login()

        response = self.client.post(self.application_view, self.data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_returns_csv_successfully(self):
        self.user.is_superuser = True
        self.user.save()
        self._login()

        response = self.client.post(self.application_view, self.data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        content = response.content.decode("utf-8")
        cvs_reader = csv.reader(io.StringIO(content))

        body = list(cvs_reader)
        headers = body.pop(0)

        self.assertEqual(headers, self.export_fields)
        self.assertEqual(len(self.team1.applications.all()), len(body))

        response_emails = [user[2] for user in body]  # Emails at index 2 of CSV
        expected_emails = [app.user.email for app in self.team1.applications.all()]
        non_expected_emails = [app.user.email for app in self.team2.applications.all()]

        for email in response_emails:
            self.assertTrue(email in expected_emails)
            self.assertFalse(email in non_expected_emails)
