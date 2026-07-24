# File: app/routers/users.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import create_access_token, get_current_user
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import (
    AccountDeactivationRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    StaffCreateRequest,
    UserOut,
    UserStatusUpdateRequest,
)
from app.services import user_service

router = APIRouter(prefix="/api/v1/users", tags=["المستخدمون"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)) -> User:
    """يُعيد بيانات المستخدم الحالي المُستخرَج من توكن الدخول."""
    return current_user


@router.patch("/me/password", response_model=TokenResponse)
def change_my_password(
    payload: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TokenResponse:
    """
    يغيّر كلمة مرور المستخدم الحالي، ما يُبطل كل توكن JWT سابق (كل
    الجلسات في كل الأجهزة)، ثم يُصدر توكناً جديداً فوراً حتى لا تنقطع
    جلسة المستخدم نفسه الذي نفّذ التغيير.
    """
    user = user_service.change_password(db, current_user, payload.current_password, payload.new_password)
    token = create_access_token({"sub": str(user.id), "role": user.role.value, "tv": user.token_version})
    return TokenResponse(access_token=token, role=user.role, full_name=user.full_name)


@router.patch("/me", response_model=UserOut)
def update_my_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> User:
    """يعدّل بيانات ملف المستخدم الحالي الشخصي (الاسم/البريد/رقم واتساب)."""
    return user_service.update_own_profile(db, current_user, payload)


@router.post("/me/deactivate")
def deactivate_my_account(
    payload: AccountDeactivationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """يوقف حساب المستخدم الحالي ذاتياً بعد تأكيد كلمة المرور، ويُبطل كل جلساته فوراً."""
    user_service.deactivate_own_account(db, current_user, payload.password)
    return {"detail": "تم إيقاف حسابك بنجاح"}


@router.post("/staff", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_staff(
    payload: StaffCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> User:
    """ينشئ حساب موظف أو مدير جديداً (بصلاحية admin فقط)."""
    return user_service.create_staff_user(db, payload, admin_user)


@router.get("", response_model=list[UserOut])
def list_users(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[User]:
    """يُعيد كل المستخدمين، مع تصفية اختيارية حسب الدور (admin فقط)."""
    return user_service.list_users(db, role)


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    payload: UserStatusUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> User:
    """يُفعّل أو يوقف حساب مستخدم (admin فقط)."""
    return user_service.set_user_active_status(db, user_id, payload.is_active, admin_user)
