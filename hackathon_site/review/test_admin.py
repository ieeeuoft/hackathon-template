from django.contrib.auth.models import Permission
from django.contrib.staticfiles.storage import staticfiles_storage
from django.db.models import Q
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.models import Team
from review.models import Review

static = staticfiles_storage.url


class TeamReviewListAdminTestCase(SetupUserMixin, TestCase):
    """
    Test the list view for team reviews, which shows lists of teams and a few custom
    fields and filters.
    """

    def setUp(self):
        super().setUp()

        self.list_view = reverse("admin:review_teamreview_changelist")
        self.view_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review"),
        )
        self.change_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review")
            | Q(codename="change_review", content_type__app_label="review"),
        )

        self.user.is_staff = True
        self.user.save()

    def _login(self, permissions=None):
        super()._login()

        if permissions is not None:
            for perm in permissions:
                self.user.user_permissions.add(perm)

    def test_list_page_not_visible_without_permissions(self):
        """
        Without view permissions, the teams review page should not be visible
        in the admin index list
        """
        self._login()
        response = self.client.get(reverse("admin:index"))
        self.assertNotContains(response, self.list_view)

    def test_list_page_permission_denied(self):
        """
        Without view permissions, the teams review page should not be accessible
        """
        self._login()
        response = self.client.get(self.list_view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_page_shows_team_member_count(self):
        """
        Test that the admin page correctly counts the number of team members
        """
        team = self._make_full_registration_team()
        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, team.team_code)
        # More precise to look for this than just the number "4"
        self.assertContains(response, '<td class="field-get_members_count">4</td>')

    def test_list_page_shows_entire_team_unreviewed(self):
        """
        When the entire team is unreviewed, an X image should appear
        """
        self._make_full_registration_team()
        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        # These are somewhat brittle tests, but the best we can do until we
        # start using selenium
        self.assertContains(
            response,
            f'<td class="field-get_is_reviewed"><img src="{static("admin/img/icon-no.svg")}" alt="False"></td>',
        )

    def test_list_page_shows_team_unreviewed_with_some_reviewed(self):
        """
        When at least one member on the team is unreviewed, the entire team should show as unreviewed
        """
        team = self._make_full_registration_team()
        for i, application in enumerate(team.applications.all()):
            if i == 3:
                # Don't review the last person
                break
            self._review(application)

        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        # These are somewhat brittle tests, but the best we can do until we
        # start using selenium
        self.assertContains(
            response,
            f'<td class="field-get_is_reviewed"><img src="{static("admin/img/icon-no.svg")}" alt="False"></td>',
        )

    def __create_teams_for_filter_test(self):
        # This makes a team, and puts 4 users on it
        team_1 = self._make_full_registration_team()

        # Move two of the users over to a new team
        team_2 = Team.objects.create()
        self.user3.application.team = team_2
        self.user3.application.save()
        self.user4.application.team = team_2
        self.user4.application.save()

        for application in team_1.applications.all():
            self._review(application)

        self._review(self.user3.application)

        return team_1, team_2

    def test_filter_by_team_is_reviewed(self):
        """
        Filter teams that have been fully reviewed
        """
        team_1, team_2 = self.__create_teams_for_filter_test()
        self._login(self.view_permissions)
        response = self.client.get(f"{self.list_view}?reviewed=true")
        self.assertContains(response, team_1.team_code)
        self.assertNotContains(response, team_2.team_code)

    def test_filter_by_team_is_not_reviewed(self):
        """
        Filter teams that have not been fully removed
        """
        team_1, team_2 = self.__create_teams_for_filter_test()
        self._login(self.view_permissions)
        response = self.client.get(f"{self.list_view}?reviewed=false")
        self.assertContains(response, team_2.team_code)
        self.assertNotContains(response, team_1.team_code)


class TeamReviewChangeAdminTestCase(SetupUserMixin, TestCase):
    """
    Test what we can of the change page for team reviews.

    There's a lot going on here in the background with formset customizations,
    but we're limited in how much we can test with Django's basic response
    testing without something like selenium.

    All of the form logic itself is tested independently of the admin site,
    so we're mostly concerned here that things display properly and don't crash.
    The formset was only modified to pass in a request parameter to the form,
    so we can be confident that the rest of the formset handling will work
    as normal.
    """

    def setUp(self):
        super().setUp()

        self.team = self._make_full_registration_team()

        self.change_view = reverse(
            "admin:review_teamreview_change", kwargs={"object_id": self.team.id}
        )

        self.view_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review"),
        )
        self.change_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review")
            | Q(codename="change_review", content_type__app_label="review"),
        )

        self.user.is_staff = True
        self.user.save()

    def _login(self, permissions=None):
        super()._login()

        if permissions is not None:
            for perm in permissions:
                self.user.user_permissions.add(perm)

    def test_permission_denied(self):
        """
        Without view permission, the change page should be inaccessible
        """
        self._login()
        response = self.client.get(self.change_view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_does_not_show_review_fields_with_view_permissions(self):
        """
        Without change permissions, only the application fields should be visible,
        not the review fields. We would prefer this not to be the case, but we're
        somewhat stuck with it, so best to assert that the behaviour is known here.
        """
        self._login(self.view_permissions)
        response = self.client.get(self.change_view)

        for field in ["quality", "interest", "experience", "status"]:
            # This is how the formset builds input IDs
            self.assertNotContains(response, f"id_applications-0-{field}")

    def test_shows_review_fields_with_change_permissions(self):
        """
        With change permissions, the selects for review fields should appear.
        """
        self._login(self.change_permissions)
        response = self.client.get(self.change_view)

        for field in ["quality", "interest", "experience", "status"]:
            self.assertContains(response, f"id_applications-0-{field}")

    def test_submits_review(self):
        """
        Manually build the post request for submitting a review for the team.
        We are primarily concerned that the request is passed into the formset
        properly, so that it makes it's way to the review form.
        """
        self._login(self.change_permissions)

        # These are hidden fields that the formset creates
        post_data = {
            "applications-TOTAL_FORMS": 4,
            "applications-INITIAL_FORMS": 4,
            "applications-0-id": self.user.application.id,
            "applications-1-id": self.user2.application.id,
            "applications-2-id": self.user3.application.id,
            "applications-3-id": self.user4.application.id,
            "_continue": "Save and continue editing",
        }

        # The formset has 4 rows (one per team member), labelled 0-3
        for i in range(4):
            for field in ("quality", "interest", "experience"):
                post_data[f"applications-{i}-{field}"] = i + 1

            post_data[f"applications-{i}-reviewer_comments"] = f"Commenting on {i}"
            post_data[f"applications-{i}-status"] = "Accepted"

        response = self.client.post(self.change_view, data=post_data)
        self.assertRedirects(response, self.change_view)

        self.assertEqual(Review.objects.count(), 4)

        # The logged in user should be passed into the review form as the reviewer
        # via the request
        for application in self.team.applications.all():
            self.assertEqual(application.review.reviewer, self.user)

    def test_shows_existing_review_fields(self):
        """
        Test that existing review fields are shown in the option dropdowns
        """

        for i, application in enumerate(self.team.applications.all()):
            self._review(
                application,
                quality=i,
                interest=i,
                experience=i,
                reviewer_comments=f"Reviewing {i}",
            )

        self._login(self.change_permissions)
        response = self.client.get(self.change_view)

        for i in range(4):
            self.assertContains(response, f'<option value="{i}" selected>{i}</option>')
            self.assertContains(response, f"Reviewing {i}")
