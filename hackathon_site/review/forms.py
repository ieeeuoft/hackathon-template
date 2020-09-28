from django import forms
from django.utils.translation import gettext_lazy as _

from registration.models import Application
from review.models import Review


class ReviewForm(forms.ModelForm):
    int_choices = [(None, "")] + [(i, str(i)) for i in range(0, 11)]

    interest = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    quality = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    experience = forms.TypedChoiceField(
        choices=int_choices, coerce=int, empty_value=None, required=True
    )
    status = forms.ChoiceField(
        choices=[(None, "")] + Review.STATUS_CHOICES, required=True
    )
    reviewer_comments = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 3, "cols": 25}), required=False
    )

    class Meta:
        model = Application
        fields = (
            "quality",
            "interest",
            "experience",
            "status",
            "reviewer_comments",
        )

    def __init__(self, request, *args, **kwargs):
        self.request = request

        super().__init__(*args, **kwargs)

        if hasattr(self.instance, "review"):
            # Pre-populate form fields with existing values
            self.fields["interest"].initial = self.instance.review.interest
            self.fields["experience"].initial = self.instance.review.experience
            self.fields["quality"].initial = self.instance.review.quality
            self.fields["status"].initial = self.instance.review.status
            self.fields["reviewer_comments"].initial = (
                self.instance.review.reviewer_comments or ""
            )

    def _save_m2m_and_review(self):
        """
        Used to make sure the review instance gets saved if commit=False.

        The standard implementation of .save() is to set
        ``self.save_m2m = self._save_m2m``, so that the user can call it
        at a later time. We append ``self._save_m2m`` to also save the review
        instance.
        """
        super()._save_m2m()
        self.review.save()

    def clean(self):
        cleaned_data = super().clean()

        if not hasattr(self.instance, "review"):
            return cleaned_data

        # Once a decision has been sent, changing the review is no longer allowed
        if self.instance.review.decision_sent_date and self.changed_data:
            raise forms.ValidationError(
                _(
                    "Reviews cannot be changed after a decision has been sent. "
                    "Revert changes, or leave and return to this page to reset all fields. "
                    f"Modified fields: {', '.join(field for field in self.changed_data)}."
                ),
                code="decision_sent",
            )

        return cleaned_data

    def save(self, commit=True):
        """
        Though this form is linked to an Application instance, it's actually
        used to save the corresponding review instance.
        """

        data = {
            "reviewer": self.request.user,
            "interest": int(self.cleaned_data["interest"]),
            "experience": int(self.cleaned_data["experience"]),
            "quality": int(self.cleaned_data["quality"]),
            "reviewer_comments": self.cleaned_data["reviewer_comments"],
            "status": self.cleaned_data["status"],
        }

        review = getattr(self.instance, "review", None)

        if review is None:
            data["application"] = self.instance
            review = Review(**data)
        else:
            for attr, value in data.items():
                setattr(review, attr, value)

        if commit:
            review.save()
        else:
            self.review = review

            # If commit=False, super().save(commit=False) will set
            # self.save_m2m = self._save_m2m, for the user to call at a later time.
            # This will now also save the review instance.
            self._save_m2m = self._save_m2m_and_review

        return super().save(commit)


class ApplicationReviewInlineFormset(forms.BaseInlineFormSet):
    def _construct_form(self, i, **kwargs):
        """
        Pass the request down into the form, so we can use it to set the reviewer.
        ``self.request`` is set by ``ApplicationInline.get_formset()`
        """
        kwargs.update({"request": self.request})
        form = super()._construct_form(i, **kwargs)
        return form
