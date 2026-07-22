from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.enums import UserRole
from app.models.user import User


def require_roles(*allowed_roles: UserRole):
    """
    Middleware/dependency صريح للتحقق من صلاحية المستخدم قبل تنفيذ أي عملية.
    يُستخدم في كل Endpoint حساس عبر Depends(require_roles(UserRole.admin, ...)).
    """

    def dependency(current_user: User = Depends(get_current_user)) -> User:
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
