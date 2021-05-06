from django.forms import FileInput


class MaterialFileInput(FileInput):
    template_name = "registration/file_input.html"
