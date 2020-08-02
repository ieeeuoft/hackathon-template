from event.models import User


class SetupUserMixin:
    def setUp(self):
        self.password = "foobar123"
        self.user = User.objects.create_user(
            username="foo@bar.com",
            password="foobar123",
            first_name="Test",
            last_name="Bar",
            email="foo@bar.com",
        )

    def _login(self):
        self.client.login(username=self.user.username, password=self.password)
