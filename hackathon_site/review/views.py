from datetime import datetime, timedelta

from django.urls import reverse_lazy
from django.shortcuts import redirect
from django.views.generic.edit import FormView
from django.contrib.auth.mixins import UserPassesTestMixin

from django.template.loader import render_to_string
from django.core import mail

from review.forms import MailerForm
from review.models import Review
from hackathon_site import settings


class MailerView(UserPassesTestMixin, FormView):
    template_name = "review/send-decisions.html"
    success_url = reverse_lazy("admin:send-decision-emails")
    form_class = MailerForm

    def test_func(self):
        return self.request.user.is_superuser

    def form_valid(self, form, **kwargs):
        """
        On form submission valid get the data and send emails depending on the status.

        Accepted / Waitlisted / Rejected emails will be sent for applications reviewed
        (with last_updated_date) between date_start and date_end. The number of emails
        for that status that will be sent is dictated by the quantity.
        """
        date_start = form.cleaned_data["date_start"]
        date_end = form.cleaned_data["date_end"]
        status = form.cleaned_data["status"]
        quantity = form.cleaned_data["quantity"]

        queryset = Review.objects.filter(
            status=status,
            updated_at__gte=date_start,
            updated_at__lte=date_end,
            decision_sent_date__isnull=True,
        )[:quantity]

        # Get a mail socket connection and manually open it
        connection = mail.get_connection(fail_silently=False)
        connection.open()

        try:
            for review in queryset:
                email = mail.EmailMessage(
                    render_to_string(
                        f"review/emails/{status.lower()}_email_subject.txt"
                    ),
                    render_to_string(
                        f"review/emails/{status.lower()}_email_body.html",
                        {  # Pass context data to the template
                            "user": review.application.user,
                            "request": self.request,
                            "rsvp_deadline": (
                                datetime.now().date()
                                + timedelta(days=settings.RSVP_DAYS)
                            ).strftime("%b %d %Y"),
                        },
                    ),
                    settings.DEFAULT_FROM_EMAIL,
                    [review.application.user.email_user],
                    connection=connection,
                )
                email.send()

                review.decision_sent_date = datetime.now().date()
                review.save()
        except Exception as e:
            raise e
        finally:
            connection.close()

        return redirect(self.get_success_url())

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        context["accepted_count"] = Review.objects.filter(
            decision_sent_date__isnull=True, status="Accepted"
        ).count()

        context["waitlisted_count"] = Review.objects.filter(
            decision_sent_date__isnull=True, status="Waitlisted"
        ).count()

        context["rejected_count"] = Review.objects.filter(
            decision_sent_date__isnull=True, status="Rejected"
        ).count()

        return context
