# File: app/core/permissions.py

from collections.abc import Callable

from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.enums import UserRole
from app.models.user import User


def require_roles(*allowed_roles: UserRole) -> Callable[[User], User]:
    """
    يبني تبعية FastAPI (Dependency) تتحقق صراحة من أن دور المستخدم
    الحالي ضمن الأدوار المسموحة قبل تنفيذ أي Endpoint حساس.

    Args:
        *allowed_roles: الأدوار المسموح لها بالوصول.

    Returns:
        Callable: دالة تبعية تُستخدم عبر Depends(require_roles(...)).
    """

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        """يتحقق من صلاحية current_user ويُعيده، أو يرفع 403."""
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ليس لديك صلاحية للقيام بهذا الإجراء",
            )
        return current_user

    return dependency


require_admin = require_roles(UserRole.admin)
require_staff = require_roles(UserRole.admin, UserRole.employee)
require_agent = require_roles(UserRole.agent)
