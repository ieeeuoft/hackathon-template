from rest_framework import permissions


class UserHasProfile(permissions.IsAuthenticated):
    """
    Allows access only to authenticate users with profiles.
    """

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user
            and hasattr(request.user, "profile")
        )
