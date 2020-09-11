from django.contrib.auth.forms import PasswordChangeForm as _PasswordChangeForm
from django.contrib.auth.forms import PasswordResetForm as _PasswordResetForm
from django.contrib.auth.forms import SetPasswordForm as _SetPasswordForm


class PasswordChangeForm(_PasswordChangeForm):
    def __init__(self, user, *args, **kwargs):
        super().__init__(user, *args, **kwargs)
        self.error_css_class = "invalid"
        self.label_suffix = ""


class PasswordResetForm(_PasswordResetForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error_css_class = "invalid"
        self.label_suffix = ""


class SetPasswordForm(_SetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error_css_class = "invalid"
        self.label_suffix = ""
