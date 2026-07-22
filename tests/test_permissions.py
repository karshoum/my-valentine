# File: tests/test_permissions.py

"""اختبارات تبعية require_roles (RBAC) على مستوى الوحدة."""

import pytest
from fastapi import HTTPException

from app.core.permissions import require_roles
from app.models.enums import UserRole


class _FakeUser:
    def __init__(self, role: UserRole):
        self.role = role


def test_require_roles_allows_matching_role():
    dependency = require_roles(UserRole.admin, UserRole.employee)
    user = _FakeUser(UserRole.admin)

    result = dependency(current_user=user)
    assert result is user


def test_require_roles_rejects_non_matching_role():
    dependency = require_roles(UserRole.admin)
    user = _FakeUser(UserRole.customer)

    with pytest.raises(HTTPException) as exc_info:
        dependency(current_user=user)
    assert exc_info.value.status_code == 403
