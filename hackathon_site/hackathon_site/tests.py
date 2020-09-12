from datetime import date

from event.models import User
from registration.models import Application, Team as RegistrationTeam


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

    def _make_full_registration_team(self, team=None):
        if team is None:
            team = RegistrationTeam.objects.create()

        self.user2 = User.objects.create_user(
            username="bob@ross.com", password="abcdef123"
        )
        self.user3 = User.objects.create_user(
            username="franklin@carmichael", password="supersecret456"
        )
        self.user4 = User.objects.create_user(
            username="lawren@harris", password="wxyz7890"
        )

        self._apply_as_user(self.user, team)
        self._apply_as_user(self.user2, team)
        self._apply_as_user(self.user3, team)
        self._apply_as_user(self.user4, team)

        return team
