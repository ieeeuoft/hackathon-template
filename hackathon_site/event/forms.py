from django.contrib.auth.forms import (
    PasswordChangeForm as _PasswordChangeForm,
    PasswordResetForm as _PasswordResetForm,
    SetPasswordForm as _SetPasswordForm,
    AuthenticationForm as _AuthenticationForm,
)


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


class AuthenticationForm(_AuthenticationForm):
    def clean_username(self):
        return self.cleaned_data["username"].lower()
