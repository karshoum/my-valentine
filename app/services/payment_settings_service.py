# File: app/services/payment_settings_service.py

"""
إدارة إعداد وسائل الدفع الوحيد (صف واحد فقط): رقم حساب بنكك، رقم واتساب
لتأكيد الفيزا، ومفتاحا تفعيل/تعطيل مستقلَّان لكل وسيلة.
"""

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.payment_settings import PaymentSettings
from app.models.user import User
from app.schemas.payment_settings import PaymentSettingsUpdateRequest
from app.services import audit_service

_SETTING_ROW_ID = 1


def get_current_settings(db: Session) -> PaymentSettings:
    """
    يُعيد إعداد وسائل الدفع الحالي، أو ينشئ صفاً افتراضياً (بلا بيانات
    حساب، ووسيلتان مفعَّلتان) إذا لم يُضبَط بعد.

    Args:
        db: جلسة قاعدة البيانات.

    Returns:
        PaymentSettings: الإعداد الحالي.
    """
    settings = db.query(PaymentSettings).filter(PaymentSettings.id == _SETTING_ROW_ID).first()
    if settings:
        return settings

    settings = PaymentSettings(id=_SETTING_ROW_ID)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_settings(db: Session, payload: PaymentSettingsUpdateRequest, admin_user: User) -> PaymentSettings:
    """
    يحدّث حقول إعداد وسائل الدفع جزئياً (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        payload: الحقول المُراد تعديلها (المُرسَلة فقط تُطبَّق).
        admin_user: المدير الذي ينفّذ التعديل.

    Returns:
        PaymentSettings: الإعداد بعد التحديث.
    """
    settings = get_current_settings(db)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(settings, field, value)

    settings.updated_by = admin_user.id
    settings.updated_at = datetime.now(timezone.utc)

    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="update_payment_settings",
        details={k: str(v) for k, v in updates.items()},
    )
    db.commit()
    db.refresh(settings)
    return settings
