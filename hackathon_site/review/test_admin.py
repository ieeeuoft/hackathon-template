from django.contrib.auth.models import Permission
from django.contrib.staticfiles.storage import staticfiles_storage
from django.db.models import Q
from django.test import TestCase
from django.urls import reverse

from hackathon_site.tests import SetupUserMixin
from registration.models import Team

static = staticfiles_storage.url


class TeamReviewListAdminTestCase(SetupUserMixin, TestCase):
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
        """
        self._login()
        response = self.client.get(reverse("admin:index"))
        self.assertNotContains(response, self.list_view)

    def test_list_page_shows_team_member_count(self):
        """
        Test that the admin page correctly counts the number of team members
        """
        team = self._make_full_registration_team()
        self._login(self.view_permissions)
        response = self.client.get(self.list_view)
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
