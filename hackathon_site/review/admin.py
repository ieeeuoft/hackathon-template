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
    evaluator_comments = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = Application
        fields = "__all__"

    def full_clean(self):
        return super().full_clean()

    def save(self, commit=True):
        super().save(commit)


class ApplicationInline(admin.TabularInline):
    model = Application
    autocomplete_fields = ("user",)
    extra = 0
    form = ReviewForm
    can_delete = False
    max_num = 0
    exclude = ("user", "gender", "ethnicity", "phone_number", "resume")
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
