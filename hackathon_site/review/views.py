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
import logging

logger = logging.getLogger(__name__)


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
        date_start = datetime.combine(
            form.cleaned_data["date_start"], datetime.min.time()
        ).replace(tzinfo=settings.TZ_INFO)
        date_end = datetime.combine(
            form.cleaned_data["date_end"], datetime.max.time()
        ).replace(tzinfo=settings.TZ_INFO)
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
                current_date = datetime.now().date()

                # Create context data for rendering the template. Note that this assumes that both the message
                # and html_message have identical context data
                render_to_string_context = {
                    "user": review.application.user,
                    "request": self.request,
                    "rsvp_deadline": (
                        current_date + timedelta(days=settings.RSVP_DAYS)
                    ).strftime("%B %-d %Y"),
                }

                review.application.user.email_user(
                    subject=render_to_string(
                        f"review/emails/{status.lower()}_email_subject.txt"
                    ),
                    message=render_to_string(
                        f"review/emails/{status.lower()}_email_body.html",
                        render_to_string_context,  # Pass context data to the template
                    ),
                    html_message=render_to_string(
                        f"review/emails/{status.lower()}_email_body.html",
                        render_to_string_context,  # Pass context data to the template
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    connection=connection,
                )

                review.decision_sent_date = current_date
                review.save()
        except Exception as e:
            logger.error(e)
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
