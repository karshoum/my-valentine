# File: app/services/flight_booking_service.py

"""
إدارة إعداد رسوم حجز الطيران الوحيد (صف واحد فقط)، وحساب الرسوم على أي
سعر تذكرة حقيقي وفقه. المدير يعدّل هذا الإعداد في أي وقت (فلات بالدولار
أو نسبة مئوية) — يُطبَّق تلقائياً على أي بحث/حجز جديد لحظتها.
"""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.enums import FlightBookingFeeType
from app.models.flight_booking import FlightBookingFeeSetting
from app.models.user import User
from app.schemas.flight_booking import FlightBookingFeeUpdateRequest
from app.services import audit_service

_SETTING_ROW_ID = 1


def get_current_fee_setting(db: Session) -> FlightBookingFeeSetting:
    """
    يُعيد إعداد رسوم حجز الطيران الحالي، أو ينشئ صفاً افتراضياً (بلا أي
    رسوم إضافية) إذا لم يُضبَط بعد.

    Args:
        db: جلسة قاعدة البيانات.

    Returns:
        FlightBookingFeeSetting: الإعداد الحالي.
    """
    setting = db.query(FlightBookingFeeSetting).filter(FlightBookingFeeSetting.id == _SETTING_ROW_ID).first()
    if setting:
        return setting

    setting = FlightBookingFeeSetting(
        id=_SETTING_ROW_ID, fee_type=FlightBookingFeeType.flat, fee_value=Decimal("0")
    )
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def update_fee_setting(
    db: Session, payload: FlightBookingFeeUpdateRequest, admin_user: User
) -> FlightBookingFeeSetting:
    """
    يحدّث نوع وقيمة رسوم حجز الطيران الحالية (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        payload: نوع الرسم (فلات/نسبة) وقيمته الجديدة.
        admin_user: المدير الذي ينفّذ التعديل.

    Returns:
        FlightBookingFeeSetting: الإعداد بعد التحديث.
    """
    setting = get_current_fee_setting(db)
    setting.fee_type = payload.fee_type
    setting.fee_value = payload.fee_value
    setting.updated_by = admin_user.id
    setting.updated_at = datetime.now(timezone.utc)

    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="update_flight_booking_fee_setting",
        details={"fee_type": payload.fee_type.value, "fee_value": str(payload.fee_value)},
    )
    db.commit()
    db.refresh(setting)
    return setting


def calculate_fee_amount(base_fare_usd: Decimal, setting: FlightBookingFeeSetting) -> Decimal:
    """
    يحسب مبلغ الرسم بالدولار المُضاف فوق سعر تذكرة حقيقي، وفق الإعداد
    الحالي (فلات ثابت، أو نسبة مئوية من السعر).

    Args:
        base_fare_usd: سعر التذكرة الحقيقي بالدولار.
        setting: إعداد الرسوم الحالي.

    Returns:
        Decimal: مبلغ الرسم بالدولار، مقرَّب لمنزلتين عشريتين.
    """
    if setting.fee_type == FlightBookingFeeType.percentage:
        return (base_fare_usd * setting.fee_value / Decimal("100")).quantize(Decimal("0.01"))
    return setting.fee_value.quantize(Decimal("0.01"))
