from datetime import datetime
from unittest.mock import patch, MagicMock

from django.conf import settings
from django.core.cache import cache
from django.contrib.auth.models import Group, Permission
from django.contrib.staticfiles.storage import staticfiles_storage
from django.db.models import Q
from django.test import TestCase
from django.template.defaultfilters import date
from django.urls import reverse
from rest_framework import status

from hackathon_site.tests import SetupUserMixin
from registration.models import Team
from review.models import Review, User

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
        # Delete a user so there's only 3 members
        self.user4.delete()
        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, team.team_code)
        # More precise to look for this than just the number "3"
        self.assertContains(response, '<td class="field-get_members_count">3</td>')

    def test_list_page_shows_team_member_count_with_filters(self):
        """
        Test that the admin page correctly counts the number of team members with filter
        """
        team = self._make_full_registration_team()
        # Delete a user so there's only 3 members
        self.user4.delete()
        self._login(self.view_permissions)
        response = self.client.get(f"{self.list_view}?reviewed=false")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, team.team_code)
        # More precise to look for this than just the number "3"
        self.assertContains(response, '<td class="field-get_members_count">3</td>')

    def test_list_page_shows_submission_date(self):
        """
        The submission date for a team is the date of the most recently submitted
        application on that team.
        """
        # Mock the function django uses to set application.updated_at
        old_updated_date = datetime(2020, 1, 1, 10, 0, 0, tzinfo=settings.TZ_INFO)
        with patch(
            "django.utils.timezone.now", MagicMock(return_value=old_updated_date)
        ):
            team = self._make_full_registration_team()

        # Make a new team member, this time with application updated_at time set to something newer
        self.user4.delete()
        self.user4 = User.objects.create_user(
            username="lawren@harris", password="wxyz7890"
        )
        new_updated_date = datetime(2020, 2, 2, 12, 0, 0, tzinfo=settings.TZ_INFO)
        with patch(
            "django.utils.timezone.now", MagicMock(return_value=new_updated_date)
        ):
            self._apply_as_user(self.user4, team)

        # This is how Django admin builds date strings
        # the time is also included on the admin site, but checking this suffices
        expected_date_string = date(new_updated_date)

        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        self.assertContains(response, expected_date_string)

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

    def test_has_link_to_get_next_team_with_change_perms(self):
        """
        Test that the link to the assignment page is in the template
        when the user has change permissions
        """
        self._login(self.change_permissions)
        response = self.client.get(self.list_view)
        self.assertContains(response, reverse("admin:assign-reviewer-to-team"))

    def test_does_not_have_link_to_get_next_team_with_view_perms(self):
        """
        Test that the link to the assignment page is not rendered
        when the user has only view permissions
        """
        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
        self.assertNotContains(response, reverse("admin:assign-reviewer-to-team"))


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

        self.reviewer_group = Group.objects.get(name="Application Reviewers")
        self.hardware_site_admin_group = Group.objects.get(name="Hardware Site Admins")

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

    def test_reviewer_group_correct_permissions(self):
        """
        Ensure the reviewer group has all the permissions it is supposed to and nothing else.
        """
        REVIEWER_PERMISSIONS = (
            "auth.view_user",
            "registration.view_application",
            "review.add_review",
            "review.change_review",
            "review.view_review",
            "review.view_teamreview",
        )

        self.assertEqual(
            self.reviewer_group.permissions.count(), len(REVIEWER_PERMISSIONS)
        )

        group_perms = self.reviewer_group.permissions.all()

        for permission_name in REVIEWER_PERMISSIONS:
            app_label, codename = permission_name.split(".", 1)
            permission = Permission.objects.get(
                content_type__app_label=app_label, codename=codename
            )
            self.assertTrue(permission in group_perms)

    def test_hss_group_correct_permissions(self):
        """
        Ensure the reviewer group has all the permissions it is supposed to and nothing else.
        """
        HARDWARE_SITE_ADMIN_PERMISSIONS = (
            "event.view_team",
            "event.change_team",
            "event.delete_team",
            "hardware.view_category",
            "hardware.change_category",
            "hardware.add_category",
            "hardware.delete_category",
            "hardware.view_hardware",
            "hardware.change_hardware",
            "hardware.add_hardware",
            "hardware.delete_hardware",
            "hardware.view_incident",
            "hardware.change_incident",
            "hardware.add_incident",
            "hardware.delete_incident",
            "hardware.view_order",
            "hardware.change_order",
            "hardware.delete_order",
            "hardware.view_orderitem",
            "hardware.change_orderitem",
            "event.change_profile",
            "event.delete_profile",
            "event.view_profile",
            "hardware.add_orderitem",
        )

        self.assertEqual(
            self.hardware_site_admin_group.permissions.count(),
            len(HARDWARE_SITE_ADMIN_PERMISSIONS),
        )

        group_perms = self.hardware_site_admin_group.permissions.all()

        for permission_name in HARDWARE_SITE_ADMIN_PERMISSIONS:
            app_label, codename = permission_name.split(".", 1)
            permission = Permission.objects.get(
                content_type__app_label=app_label, codename=codename
            )
            self.assertTrue(permission in group_perms)

    def test_does_not_show_review_fields_with_view_permissions(self):
        """
        Without change permissions, only the application fields should be visible,
        not the review fields. We would prefer this not to be the case, but we're
        somewhat stuck with it, so best to assert that the behaviour is known here.
        """
        self._login(self.view_permissions)
        response = self.client.get(self.change_view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        for field in ["quality", "interest", "experience", "status"]:
            # This is how the formset builds input IDs
            self.assertNotContains(response, f"id_applications-0-{field}")

    def test_shows_review_fields_with_change_permissions(self):
        """
        With change permissions, the selects for review fields should appear.
        """
        self._login(self.change_permissions)
        response = self.client.get(self.change_view)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

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


class AssignReviewerToTeamViewTestCase(SetupUserMixin, TestCase):
    def setUp(self):
        super().setUp()

        self.view = reverse("admin:assign-reviewer-to-team")

        self.user.is_staff = True
        self.user.save()

        self.user2_password = "abcdef123"
        self.user2 = User.objects.create_user(
            username="frederick@varley.com", password=self.user2_password
        )
        self.user2.is_staff = True
        self.user2.save()

        self.change_permissions = Permission.objects.filter(
            Q(codename="view_application", content_type__app_label="registration")
            | Q(codename="view_review", content_type__app_label="review")
            | Q(codename="change_review", content_type__app_label="review"),
        )

        for perm in self.change_permissions:
            self.user.user_permissions.add(perm)
            self.user2.user_permissions.add(perm)

        # team1 is entirely reviewed
        self.team1 = self._make_full_registration_team(self_users=False)
        for application in self.team1.applications.all():
            self._review(application)

        # team2 is missing a single review
        self.team2 = self._make_full_registration_team(self_users=False)
        for application in self.team2.applications.all()[:2]:
            self._review(application)

        # team3 is entirely unreviewed
        self.team3 = self._make_full_registration_team(self_users=False)

    def tearDown(self):
        super().tearDown()
        cache.clear()

    def test_permission_denied_without_change_perm(self):
        """
        Without review.change_review permission, the view should not work
        """
        review_change_permission = Permission.objects.get(
            codename="change_review", content_type__app_label="review"
        )
        self.user.user_permissions.remove(review_change_permission)
        self._login()
        response = self.client.get(self.view)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_takes_to_oldest_team_with_missing_reviews(self):
        """
        Test that the user is redirected to the oldest team with unreviewed
        applications
        """

        self._login()
        response = self.client.get(self.view)

        # team2 should be the assigned view, since that one is the oldest
        # team with missing reviews
        expected_url = reverse(
            "admin:review_teamreview_change", kwargs={"object_id": self.team2.id}
        )
        self.assertRedirects(response, expected_url)

    def test_skips_team_assigned_to_another_user(self):
        """
        Test that the user is redirected to the oldest team with unreviewed
        applications that is not assigned to another reviewed
        """

        # Login as self.user
        self._login()
        self.client.get(self.view)

        # team2 should now be assigned to self.user
        # if we get again as a different user, we should be given team3
        self.client.login(username=self.user2.username, password=self.user2_password)
        response = self.client.get(self.view)
        expected_url = reverse(
            "admin:review_teamreview_change", kwargs={"object_id": self.team3.id}
        )
        self.assertRedirects(response, expected_url)

    def test_all_teams_reviewed(self):
        """
        Test that a message is displayed on the changelist page if all teams
        have been reviewed
        """

        # Review the rest of team2
        for application in self.team2.applications.filter(review__isnull=True):
            self._review(application)

        for application in self.team3.applications.all():
            self._review(application)

        self._login()
        response = self.client.get(self.view, follow=True)
        expected_url = reverse("admin:review_teamreview_changelist")
        self.assertRedirects(response, expected_url)
        self.assertContains(response, "No more teams remaining")

    def test_all_teams_reviewed_or_assigned(self):
        """
        When all teams have been either reviewed or are assigned a reviewer,
        a message saying there are no teams left should be displayed
        """

        # Review the rest of team2
        for application in self.team2.applications.filter(review__isnull=True):
            self._review(application)

        for application in self.team3.applications.all():
            self._review(application)

        self._login()
        # Will assign self.user to team3
        self.client.get(self.view)

        # Login as a different user. Should be taken back to the changelist page
        self.client.login(username=self.user2.username, password=self.user2_password)
        response = self.client.get(self.view, follow=True)
        expected_url = reverse("admin:review_teamreview_changelist")
        self.assertRedirects(response, expected_url)
        self.assertContains(response, "No more teams remaining")
