import re
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

from django.test import TestCase
from django.urls import reverse
from django.core import mail
from django.conf import settings
from hackathon_site.tests import SetupUserMixin
from django.contrib.auth.models import Permission
from django.db.models import Q
from rest_framework import status
from review.models import Review, User


class MailerTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.view = reverse("admin:send-decision-emails")

        self.user.is_staff = True
        self.user.save()

        self.form_data = {
            "date_start": datetime.now().replace(tzinfo=settings.TZ_INFO).date(),
            "date_end": datetime.now().replace(tzinfo=settings.TZ_INFO).date()
            + timedelta(days=1),
            "status": "Accepted",
            "quantity": 1,
        }

    def _login(self, superuser=True):
        super()._login()

        if superuser:
            self.user.is_superuser = True
            self.user.save()

    def _create_teams_and_reviews_for_mail_tests(
        self, sent_date=None, date_offset=None
    ):
        """
        Creates 4 teams as follows:
        Team 1: 4 accepted
        Team 2: 3 Accepted, 1 Waitlisted
        Team 3: 1 Accepted, 1 Waitlisted, 2 Rejected
        Team 4: 4 Rejected

        If older_updated_date is not None then it makes 1 Accepted, 1 Waitlisted and 2 Rejected
        reviews older by the amount passed in through older_updated_date
        """
        older_updated_date = None
        if date_offset is not None:
            older_updated_date = datetime.now().replace(
                tzinfo=settings.TZ_INFO
            ) - timedelta(date_offset)

        team1 = self._make_full_registration_team(self_users=False)
        team2 = self._make_full_registration_team(self_users=False)
        team3 = self._make_full_registration_team(self_users=False)
        team4 = self._make_full_registration_team(self_users=False)

        # Everyone in Team 1 Accepted
        for application in team1.applications.all():
            self._review(application, status="Accepted", decision_sent_date=sent_date)

        # 3 Accepted, 1 Waitlisted in Team 2
        for i, application in enumerate(team2.applications.all()):
            if older_updated_date is not None and i == 3:
                with patch(
                    "django.utils.timezone.now",
                    MagicMock(return_value=older_updated_date),
                ):
                    self._review(
                        application, status="Waitlisted", decision_sent_date=sent_date,
                    )
            elif i == 3:
                self._review(
                    application, status="Waitlisted", decision_sent_date=sent_date
                )
            else:
                self._review(
                    application, status="Accepted", decision_sent_date=sent_date
                )

        # 1 Accepted, 1 Waitlisted, 2 Rejected in Team 3
        for i, application in enumerate(team3.applications.all()):
            if older_updated_date is not None and i == 2:
                with patch(
                    "django.utils.timezone.now",
                    MagicMock(return_value=older_updated_date),
                ):
                    self._review(
                        application, status="Accepted", decision_sent_date=sent_date
                    )
            elif i == 2:
                self._review(
                    application, status="Accepted", decision_sent_date=sent_date
                )

            elif i == 3:
                self._review(
                    application, status="Waitlisted", decision_sent_date=sent_date
                )
            elif older_updated_date is not None and i < 2:
                with patch(
                    "django.utils.timezone.now",
                    MagicMock(return_value=older_updated_date),
                ):
                    self._review(
                        application, status="Rejected", decision_sent_date=sent_date
                    )
            else:
                self._review(
                    application, status="Rejected", decision_sent_date=sent_date
                )

        # Everyone in Team 1 Rejected
        for application in team4.applications.all():
            self._review(application, status="Rejected", decision_sent_date=sent_date)

        return team1, team2, team3, team4

    def test_regular_users_page_not_visible_without_permissions(self):
        self._login(superuser=False)
        response = self.client.get(self.view)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_super_users_page_visible(self):
        self._login()
        response = self.client.get(self.view)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_decisions_button_not_visible_if_not_superuser(self):
        self.view_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review"),
        )
        self._login(superuser=False)
        for perm in self.view_permissions:
            self.user.user_permissions.add(perm)

        response = self.client.get(reverse("admin:review_teamreview_changelist"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "Send Decisions")

    def test_sends_quantity_number_of_accepted_emails(self):
        self._login()
        self._create_teams_and_reviews_for_mail_tests()

        quantity_before = Review.objects.filter(
            decision_sent_date__isnull=True, status="Accepted"
        ).count()

        self.form_data["quantity"] = 3  # Send 3 acceptance emails

        response = self.client.post(self.view, data=self.form_data)

        quantity_after = Review.objects.filter(
            decision_sent_date__isnull=True, status="Accepted"
        ).count()

        self.assertEqual(len(mail.outbox), 3)
        self.assertRedirects(response, self.view)
        self.assertEqual(quantity_before, quantity_after + self.form_data["quantity"])

    def test_send_all_accepted_within_current_date_range(self):
        self._login()
        self._create_teams_and_reviews_for_mail_tests(date_offset=5)

        quantity_before = Review.objects.filter(
            decision_sent_date__isnull=True, status="Accepted"
        ).count()

        # Send 10 acceptance emails. There's only 8 accepted people, and 1 older. So should
        # only send 7 emails
        self.form_data["quantity"] = 10
        self.form_data["status"] = "Accepted"

        response = self.client.post(self.view, data=self.form_data)

        quantity_after = Review.objects.filter(
            decision_sent_date__isnull=True, status="Accepted"
        ).count()

        self.assertEqual(len(mail.outbox), 7)
        self.assertRedirects(response, self.view)
        self.assertEqual(quantity_before, quantity_after + 7)

        expected_users = User.objects.filter(
            application__review__updated_at__gte=datetime.combine(
                self.form_data["date_start"], datetime.min.time()
            ).replace(tzinfo=settings.TZ_INFO),
            application__review__updated_at__lte=datetime.combine(
                self.form_data["date_end"], datetime.max.time()
            ).replace(tzinfo=settings.TZ_INFO),
            application__review__decision_sent_date__isnull=True,
            application__review__status=self.form_data["status"],
        )

        emailed_users = [email.to[0] for email in mail.outbox]

        for user in expected_users:
            self.assertIn(user.email, emailed_users)

    def test_correct_text_in_accepted_email(self):
        self._login()
        self._create_teams_and_reviews_for_mail_tests()

        # Send 1 accepted email
        response = self.client.post(self.view, data=self.form_data)

        clean = re.compile("<.*?>")
        clean_mail_body = re.sub(clean, "", mail.outbox[0].body)

        link = f"http://testserver{reverse('event:dashboard')}"

        rsvp_deadline = (
            datetime.now().date() + timedelta(days=settings.RSVP_DAYS)
        ).strftime("%B %-d %Y")

        self.assertIn(link, mail.outbox[0].body)
        if settings.RSVP:
            self.assertIn(rsvp_deadline, mail.outbox[0].body)
        self.assertIn(settings.HACKATHON_NAME, mail.outbox[0].body)
        self.assertIn(settings.PARTICIPANT_PACKAGE_LINK, mail.outbox[0].body)
        self.assertIn(settings.CHAT_ROOM[0], mail.outbox[0].body)
        self.assertIn(settings.CHAT_ROOM[1], mail.outbox[0].body)
        self.assertIn(
            f"Congratulations, you’ve been accepted to { settings.HACKATHON_NAME }",
            mail.outbox[0].subject,
        )
        self.assertIn(
            f"The {settings.HACKATHON_NAME} team has reviewed your application, and we’re excited to welcome you to {settings.HACKATHON_NAME}!",
            clean_mail_body,
        )

        # Check that email was passed in correctly is a real user
        self.assertTrue(User.objects.filter(email=mail.outbox[0].to[0]).exists())

    def test_correct_text_in_waitlisted_email(self):
        self._login()
        self._create_teams_and_reviews_for_mail_tests()

        # Send 1 waitlisted email
        self.form_data["status"] = "Waitlisted"
        self.client.post(self.view, data=self.form_data)

        clean = re.compile("<.*?>")
        clean_mail_body = re.sub(clean, "", mail.outbox[0].body)

        link = f"http://testserver{reverse('event:dashboard')}"

        self.assertIn(link, mail.outbox[0].body)
        self.assertIn(settings.HACKATHON_NAME, mail.outbox[0].body)
        self.assertIn(
            settings.FINAL_REVIEW_RESPONSE_DATE.strftime("%B %-d, %Y"),
            mail.outbox[0].body,
        )
        self.assertIn(
            f"{ settings.HACKATHON_NAME } Application Decision", mail.outbox[0].subject
        )
        self.assertIn(
            f"we have decided to defer your application to the next round",
            clean_mail_body,
        )

    def test_correct_text_in_rejected_email(self):
        self._login()
        self._create_teams_and_reviews_for_mail_tests()

        # Send 1 rejected email
        self.form_data["status"] = "Rejected"
        self.client.post(self.view, data=self.form_data)

        clean = re.compile("<.*?>")
        clean_mail_body = re.sub(clean, "", mail.outbox[0].body)

        self.assertIn(settings.HACKATHON_NAME, mail.outbox[0].body)
        self.assertIn(
            f"{ settings.HACKATHON_NAME } Application Decision", mail.outbox[0].subject
        )
        self.assertIn(
            "we are not able to offer you a spot in the event this year",
            clean_mail_body,
        )
