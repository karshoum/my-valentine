# File: app/routers/payment_settings.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.payment_settings import PaymentSettings
from app.models.user import User
from app.schemas.payment_settings import PaymentSettingsOut, PaymentSettingsUpdateRequest
from app.services import payment_settings_service

router = APIRouter(prefix="/api/v1/payment-settings", tags=["إعداد وسائل الدفع"])


@router.get("", response_model=PaymentSettingsOut)
def get_payment_settings(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> PaymentSettings:
    """يُعيد إعداد وسائل الدفع الحالي (أي مستخدم مسجَّل دخوله — يُستهلَك من شاشة الدفع)."""
    return payment_settings_service.get_current_settings(db)


@router.patch("", response_model=PaymentSettingsOut)
def update_payment_settings(
    payload: PaymentSettingsUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> PaymentSettings:
    """يحدّث إعداد وسائل الدفع (admin فقط)."""
    return payment_settings_service.update_settings(db, payload, admin_user)
