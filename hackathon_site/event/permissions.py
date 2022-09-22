import copy

from rest_framework import permissions
from rest_framework.permissions import DjangoModelPermissions


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


class UserIsAdmin(permissions.IsAuthenticated):
    """
    Allows access only to authenticate users with admin permissions.
    """

    def has_permission(self, request, view):
        return (
            super().has_permission(request, view)
            and request.user
            and request.user.groups.filter(name="Hardware Site Admins").exists()
        )


class FullDjangoModelPermissions(DjangoModelPermissions):
    """
    Adds view permission requirements, which are otherwise not checked by DjangoModelPermissions
    """

    def __init__(self):
        self.perms_map = copy.deepcopy(self.perms_map)
        self.perms_map["GET"] = ["%(app_label)s.view_%(model_name)s"]
        self.perms_map["OPTIONS"] = ["%(app_label)s.view_%(model_name)s"]
        self.perms_map["HEAD"] = ["%(app_label)s.view_%(model_name)s"]
