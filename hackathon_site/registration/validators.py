from django.core import validators
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.deconstruct import deconstructible
from django.utils.translation import ugettext_lazy as _
from django.template.defaultfilters import filesizeformat


@deconstructible
class UploadedFileValidator:
    """
    Validator for uploaded files through file fields checking file size and content type.

    Based on https://github.com/mbourqui/django-constrainedfilefield/blob/master/constrainedfilefield/fields/file.py
    """

    def __init__(self, content_types=None, max_upload_size=None):
        """
        :param content_types: list of str
            List of allowed content types. Example: ["application/pdf", "image/jpeg"]
        :param max_upload_size: int
            Maximum allowed upload size, in bytes
        """
        self.content_types = content_types if content_types is not None else []
        self.max_upload_size = max_upload_size if max_upload_size is not None else 0

    def __call__(self, value):
        file: InMemoryUploadedFile = value.file

        if self.max_upload_size and file.size > self.max_upload_size:
            raise validators.ValidationError(
                _(
                    "File must be no bigger than %(max_size)s. Currently %(current_size)s."
                )
                % {
                    "max_size": filesizeformat(self.max_upload_size),
                    "current_size": filesizeformat(file.size),
                }
            )

        if self.content_types and file.content_type not in self.content_types:
            raise validators.ValidationError(
                _(
                    "Unsupported file type: %(file_type)s. Allowed file types: %(allowed_types)s."
                )
                % {
                    "file_type": file.content_type,
                    "allowed_types": ", ".join(self.content_types),
                }
            )

    def __eq__(self, other):
        return (
            isinstance(other, UploadedFileValidator)
            and self.content_types == other.content_types
            and self.max_upload_size == other.max_upload_size
        )
