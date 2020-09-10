from django.contrib.auth.forms import PasswordChangeForm as _PasswordChangeForm


class PasswordChangeForm(_PasswordChangeForm):
    def __init__(self, user, *args, **kwargs):
        super().__init__(user, *args, **kwargs)
        self.error_css_class = "invalid"
        self.label_suffix = ""
