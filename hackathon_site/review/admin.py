from django import forms
from django.contrib import admin
from django.utils.safestring import mark_safe

from registration.models import Application
from review.models import Review, TeamProxy

admin.site.register(Review)


class ReviewForm(forms.ModelForm):
    int_choices = [("", "")] + [(str(i),) * 2 for i in range(0, 11)]

    interest = forms.ChoiceField(choices=int_choices)
    quality = forms.ChoiceField(choices=int_choices)
    experience = forms.ChoiceField(choices=int_choices)
    status = forms.ChoiceField(choices=[("", "")] + Review.STATUS_CHOICES)
    reviewer_comments = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = Application
        fields = "__all__"

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

        return super().save(commit)

    def __init__(self, *args, **kwargs):
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


class ApplicationReviewInlineFormset(forms.BaseInlineFormSet):
    def _construct_form(self, i, **kwargs):
        form = super()._construct_form(i, **kwargs)
        form.request = self.request
        return form


class ApplicationInline(admin.TabularInline):
    model = Application
    autocomplete_fields = ("user",)
    extra = 0
    form = ReviewForm
    formset = ApplicationReviewInlineFormset
    can_delete = False
    max_num = 0
    exclude = ("user", "gender", "ethnicity", "phone_number", "resume", "rsvp")
    readonly_fields = (
        "get_user_full_name",
        "q1",
        "q2",
        "q3",
        "get_resume_link",
        "study_level",
        "school",
        "graduation_year",
        "birthday",
        "conduct_agree",
        "data_agree",
    )

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    get_user_full_name.short_description = "Full Name"

    def get_resume_link(self, obj):
        link = '<a href="{}" target="_blank">{}</a>'.format(
            obj.resume.url, obj.resume.name.split("/")[-1]
        )
        return mark_safe(link)

    get_resume_link.short_description = "Resume"

    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        formset.request = request
        return formset


@admin.register(TeamProxy)
class TeamAppliedAdmin(admin.ModelAdmin):
    search_fields = ("id", "team_code")
    list_display = ("team_code", "get_members_count")
    inlines = (ApplicationInline,)
    readonly_fields = ("team_code",)

    def get_members_count(self, obj):
        return obj.applications.count()

    get_members_count.short_description = "Members"

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("applications")
