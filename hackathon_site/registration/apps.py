from django.apps import AppConfig


class RegistrationConfig(AppConfig):
    name = "registration"

    def ready(self):
        from registration import signals
