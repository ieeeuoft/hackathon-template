from django.urls import path, re_path

from event import api_views, views

app_name = "event"

urlpatterns = [
    path("users/user/", api_views.CurrentUserAPIView.as_view(), name="current-user"),
    path("teams/team/", views.CurrentTeamAPIView.as_view(), name="current-team"),
    path("teams/leave_team/", api_views.LeaveTeamView.as_view(), name="leave-team"),
    path("teams/", views.TeamListView.as_view(), name="team-list"),
    path("teams/<str:team_code>", views.TeamCodeView.as_view(), name="team-code-detail"),
]
