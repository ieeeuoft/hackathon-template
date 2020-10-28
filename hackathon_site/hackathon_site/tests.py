from datetime import date, datetime
from unittest.mock import patch
from uuid import uuid4

from django.conf import settings
from django.test import TestCase, override_settings

from event.models import User
from hackathon_site.utils import is_registration_open
from registration.models import Application, Team as RegistrationTeam
from review.models import Review


class SetupUserMixin:
    def setUp(self):
        self.password = "foobar123"
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password=self.password,
            first_name="Test",
            last_name="Bar",
            email="foo@bar.com",
        )

    def _login(self):
        self.client.login(username=self.user.username, password=self.password)

    @staticmethod
    def _apply_as_user(user, team=None):
        if team is None:
            team = RegistrationTeam.objects.create()

        application_data = {
            "birthday": date(2000, 1, 1),
            "gender": "no-answer",
            "ethnicity": "no-answer",
            "phone_number": "1234567890",
            "school": "UofT",
            "study_level": "other",
            "graduation_year": 2020,
            "q1": "hi",
            "q2": "there",
            "q3": "foo",
            "conduct_agree": True,
            "data_agree": True,
            "resume": "uploads/resumes/my_resume.pdf",
        }
        return Application.objects.create(user=user, team=team, **application_data)

    def _apply(self):
        return self._apply_as_user(self.user)

    @staticmethod
    def _get_random_email():
        """
        Return a random email not associated with any user
        """
        uuid = uuid4().hex
        email = f"{uuid[:10]}@{uuid[10:20]}.com"
        while User.objects.filter(username=email).exists():
            uuid = uuid4().hex
            email = f"{uuid[:10]}@{uuid[10:20]}.com"
        return email

    def _make_full_registration_team(self, team=None, self_users=True):
        if team is None:
            team = RegistrationTeam.objects.create()

        if self_users:
            user1 = self.user
            user2 = self.user2 = User.objects.create_user(
                username="frank@johnston.com",
                password="hellothere31415",
                email="frank@johnston.com",
                first_name="Frank",
                last_name="Johnston",
            )
            user3 = self.user3 = User.objects.create_user(
                username="franklin@carmichael.com",
                password="supersecret456",
                email="franklin@carmichael.com",
                first_name="Franklin",
                last_name="Carmichael",
            )
            user4 = self.user4 = User.objects.create_user(
                username="lawren@harris.com",
                password="wxyz7890",
                email="lawren@harris.com",
                first_name="Lawren",
                last_name="Harris",
            )
        else:
            # Make some random users
            email1 = self._get_random_email()
            email2 = self._get_random_email()
            email3 = self._get_random_email()
            email4 = self._get_random_email()

            user1 = User.objects.create_user(
                username=email1,
                password="foobar123",
                email=email1,
                first_name="John1",
                last_name="Doe1",
            )
            user2 = User.objects.create_user(
                username=email2,
                password="foobar123",
                email=email2,
                first_name="John2",
                last_name="Doe2",
            )
            user3 = User.objects.create_user(
                username=email3,
                password="foobar123",
                email=email3,
                first_name="John3",
                last_name="Doe3",
            )
            user4 = User.objects.create_user(
                username=email4,
                password="foobar123",
                email=email4,
                first_name="John4",
                last_name="Doe4",
            )

        self._apply_as_user(user1, team)
        self._apply_as_user(user2, team)
        self._apply_as_user(user3, team)
        self._apply_as_user(user4, team)

        return team

    def _review(
        self, application=None, reviewer=None, **kwargs,
    ):
        if application is None:
            application = self.user.application

        if reviewer is None:
            try:
                self.reviewer = User.objects.get(username="arther@lismer.com")
            except User.DoesNotExist:
                self.reviewer = User.objects.create_user(
                    username="arther@lismer.com", password="abcdef123"
                )
                reviewer = self.reviewer

        decision_sent_date = kwargs.pop(
            "decision_sent_date", datetime.now().replace(tzinfo=settings.TZ_INFO).date()
        )

        default_kwargs = {
            "reviewer": reviewer,
            "application": application,
            "interest": 10,
            "experience": 10,
            "quality": 10,
            "status": "Accepted",
            "reviewer_comments": "Very good",
            "decision_sent_date": decision_sent_date,
        }
        default_kwargs.update(kwargs)

        self.review = Review.objects.create(**default_kwargs)


@override_settings(IN_TESTING=False)
class IsRegistrationOpenTestCase(TestCase):
    @override_settings(
        REGISTRATION_OPEN_DATE=datetime(2020, 1, 2, tzinfo=settings.TZ_INFO)
    )
    @patch("hackathon_site.utils.datetime")
    def test_not_open_yet(self, mock_datetime):
        mock_datetime.now.return_value.replace.return_value = datetime(
            2020, 1, 1, tzinfo=settings.TZ_INFO
        )
        self.assertFalse(is_registration_open())

    @override_settings(
        REGISTRATION_OPEN_DATE=datetime(2020, 1, 1, tzinfo=settings.TZ_INFO)
    )
    @override_settings(
        REGISTRATION_CLOSE_DATE=datetime(2020, 1, 3, tzinfo=settings.TZ_INFO)
    )
    @patch("hackathon_site.utils.datetime")
    def test_is_open(self, mock_datetime):
        mock_datetime.now.return_value.replace.return_value = datetime(
            2020, 1, 2, tzinfo=settings.TZ_INFO
        )
        self.assertTrue(is_registration_open())

    @override_settings(
        REGISTRATION_CLOSE_DATE=datetime(2020, 1, 1, tzinfo=settings.TZ_INFO)
    )
    @patch("hackathon_site.utils.datetime")
    def test_not_open_anymore(self, mock_datetime):
        mock_datetime.now.return_value.replace.return_value = datetime(
            2020, 1, 2, tzinfo=settings.TZ_INFO
        )
        self.assertFalse(is_registration_open())
