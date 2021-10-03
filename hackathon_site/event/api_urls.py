from django.urls import path

from event import api_views, views

app_name = "event"

urlpatterns = [
    path("users/user/", api_views.CurrentUserAPIView.as_view(), name="current-user"),
    path("teams/team/", views.CurrentTeamAPIView.as_view(), name="current-team"),
    path("teams/leave_team/", api_views.LeaveTeamView.as_view(), name="leave-team"),
    re_path(
        r"^profiles/(?P<pk>[0-9]+)/$",
        views.ProfileDetailView.as_view(),
        name="profile-detail",
    ),
]
