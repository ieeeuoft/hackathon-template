import datetime

from django import forms


class MailerForm(forms.Form):
    date_start = forms.DateField(label="Start date", initial=datetime.date.today)
    date_end = forms.DateField(label="End date", initial=datetime.date.today)
    status = forms.ChoiceField(
        label="Applicant statuses to send to",
        choices=[
            ("", ""),
            ("Accepted", "Accepted"),
            ("Waitlisted", "Waitlisted"),
            ("Rejected", "Rejected"),
        ],
    )
    quantity = forms.IntegerField(label="Maximum number of emails to send", initial=100)
