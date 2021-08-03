from django.apps import AppConfig


class EventConfig(AppConfig):
    name = "event"

    def ready(self):
        from event import signals
