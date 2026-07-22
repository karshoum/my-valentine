from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import StaffCreateRequest, UserOut, UserStatusUpdateRequest
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["المستخدمون"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/staff", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return user_service.create_staff_user(db, payload, admin_user)


@router.get("", response_model=list[UserOut])
def list_users(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return user_service.list_users(db, role)


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return user_service.set_user_active_status(db, user_id, payload.is_active, admin_user)
