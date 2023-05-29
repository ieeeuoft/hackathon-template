from django.urls import re_path, path

from event import api_views, views

app_name = "event"

urlpatterns = [
    path("users/user/", api_views.CurrentUserAPIView.as_view(), name="current-user"),
    path(
        "users/user/review_status/",
        api_views.CurrentUserReviewStatusAPIView.as_view(),
        name="current-user-review-status",
    ),
    path("teams/team/", api_views.CurrentTeamAPIView.as_view(), name="current-team"),
    re_path(
        "teams/join/(?P<team_code>[A-Z0-9]{5})/",
        api_views.JoinTeamView.as_view(),
        name="join-team",
    ),
    path("teams/leave_team/", api_views.LeaveTeamView.as_view(), name="leave-team"),
    path(
        "profiles/<int:pk>/",
        api_views.ProfileDetailView.as_view(),
        name="profile-detail",
    ),
    path(
        "profiles/profile/",
        api_views.CurrentProfileView.as_view(),
        name="current-profile",
    ),
    path("teams/", views.TeamListView.as_view(), name="team-list"),
    path(
        "teams/team/incidents/",
        api_views.TeamIncidentListView.as_view(),
        name="incident-list",
    ),
    path(
        "teams/team/orders/",
        api_views.CurrentTeamOrderListView.as_view(),
        name="team-orders",
    ),
    re_path(
        "teams/(?P<team_code>[A-Z0-9]{5})/",
        api_views.TeamDetailView.as_view(),
        name="team-detail",
    ),
    path(
        "teams/team/orders/<int:pk>/",
        api_views.TeamOrderDetailView.as_view(),
        name="team-order-detail",
    ),
]
