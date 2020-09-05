from django_registration.backends.activation.views import RegistrationView

from registration.forms import SignUpForm


class SignUpView(RegistrationView):
    template_name = "registration/signup.html"
    form_class = SignUpForm
