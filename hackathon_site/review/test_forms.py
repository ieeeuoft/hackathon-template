from datetime import datetime

from django.conf import settings
from django.test import TestCase

from hackathon_site.tests import SetupUserMixin
from review.forms import ReviewForm
from review.models import Review, User


class ReviewFormTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()

        self.data = {
            "interest": 5,
            "quality": 5,
            "experience": 5,
            "reviewer_comments": "Average",
            "status": "Waitlisted",
        }

        self.reviewer2 = User.objects.create_user(
            username="franklin@carmichael.com", password="abcdef123"
        )

        class FakeRequest:
            user = self.reviewer2

        self.request = FakeRequest()

    def _review(
        self,
        application=None,
        reviewer=None,
        status="Accepted",
        decision_sent_date=None,
    ):
        """
        Replace this with SetupUserMixin._review once that's been merged in from
        the RSVP view branch
        """
        if reviewer is None:
            self.reviewer = User.objects.create_user(
                username="bob@ross.com", password="abcdef123"
            )
        else:
            self.reviewer = reviewer

        if application is None:
            self._apply()
            application = self.user.application

        if decision_sent_date is None:
            decision_sent_date = datetime.now().replace(tzinfo=settings.TZ_INFO).date()
        elif decision_sent_date is False:
            # This is a strange way to omit decision_sent_date, while keeping pycharm
            # happy about types
            decision_sent_date = None

        self.review = Review.objects.create(
            reviewer=self.reviewer,
            application=application,
            interest=10,
            experience=10,
            quality=10,
            status=status,
            reviewer_comments="Very good",
            decision_sent_date=decision_sent_date,
        )

    def test_initializes_fields_from_instance(self):
        self._review()
        form = ReviewForm(instance=self.user.application, request=self.request)
        for field in (
            "interest",
            "experience",
            "quality",
            "status",
            "reviewer_comments",
        ):
            self.assertEqual(form.fields[field].initial, getattr(self.review, field))

    def test_does_not_initialize_with_no_instance(self):
        form = ReviewForm(request=self.request)
        for field in (
            "interest",
            "experience",
            "quality",
            "status",
            "reviewer_comments",
        ):
            self.assertIsNone(form.fields[field].initial)

    def test_does_not_allow_changes_after_decision_sent(self):
        self._review()
        form = ReviewForm(
            instance=self.user.application, data={"interest": 1}, request=self.request
        )
        self.assertFalse(form.is_valid())
        self.assertEqual(len(form.non_field_errors()), 1)
        self.assertIn(
            "Reviews cannot be changed after a decision has been sent.",
            form.non_field_errors()[0],
        )

    def test_save_form_with_no_existing_review(self):
        self._apply()

        form = ReviewForm(
            instance=self.user.application, data=self.data, request=self.request
        )
        self.assertTrue(form.is_valid())
        form.save()

        self.user.refresh_from_db()
        self.assertTrue(hasattr(self.user.application, "review"))

        review = self.user.application.review
        for field in self.data:
            self.assertEqual(getattr(review, field), self.data[field])
        self.assertEqual(review.reviewer, self.reviewer2)

    def test_save_form_with_existing_review(self):
        # Reviews are allowed to be changed as long as a decision
        # has not been sent (tested above)
        self._review(decision_sent_date=False)

        form = ReviewForm(
            instance=self.user.application, data=self.data, request=self.request
        )
        self.assertTrue(form.is_valid())
        form.save()

        self.user.refresh_from_db()

        review = self.user.application.review
        for field in self.data:
            self.assertEqual(getattr(review, field), self.data[field])
        # The reviewer should be updated
        self.assertEqual(review.reviewer, self.reviewer2)

    def test_save_with_commit_false(self):
        """
        When save is called with commit=False, the review should be set on the form
        and form.save_m2m should be set to form._save_m2m_and_review()
        """
        self._apply()

        form = ReviewForm(
            instance=self.user.application, data=self.data, request=self.request
        )
        form.is_valid()
        form.save(commit=False)

        self.assertIsInstance(form.review, Review)

        self.user.refresh_from_db()
        self.assertFalse(hasattr(self.user.application, "review"))

        form.save_m2m()
        self.user.refresh_from_db()
        self.assertTrue(hasattr(self.user.application, "review"))
        self.assertEqual(form.review, self.user.application.review)
