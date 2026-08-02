# File: app/services/ship_booking_fee_service.py

"""
إدارة إعداد رسم حجز تذاكر البواخر الوحيد (صف واحد فقط)، وحساب سعر حجز
كامل (السعر الحقيقي لخط الباخرة + الرسم، مع تطبيق خصم "تذاكر بواخر"
الساري على الرسم فقط دون المساس بسعر الخط الحقيقي).
"""

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.enums import FlightBookingFeeType, ServiceCategory
from app.models.ship_booking_fee import ShipBookingFeeSetting
from app.models.ship_route import ShipRoute
from app.models.user import User
from app.schemas.ship_booking_fee import ShipBookingFeeUpdateRequest, ShipRouteQuoteOut
from app.services import audit_service, flight_booking_service, service_service

_SETTING_ROW_ID = 1


def get_current_fee_setting(db: Session) -> ShipBookingFeeSetting:
    """
    يُعيد إعداد رسم حجز البواخر الحالي، أو ينشئ صفاً افتراضياً (بلا أي
    رسوم إضافية) إذا لم يُضبَط بعد.

    Args:
        db: جلسة قاعدة البيانات.

    Returns:
        ShipBookingFeeSetting: الإعداد الحالي.
    """
    setting = db.query(ShipBookingFeeSetting).filter(ShipBookingFeeSetting.id == _SETTING_ROW_ID).first()
    if setting:
        return setting

    setting = ShipBookingFeeSetting(id=_SETTING_ROW_ID, fee_type=FlightBookingFeeType.flat, fee_value=Decimal("0"))
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def update_fee_setting(db: Session, payload: ShipBookingFeeUpdateRequest, admin_user: User) -> ShipBookingFeeSetting:
    """
    يحدّث نوع وقيمة رسم حجز البواخر الحالي (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        payload: نوع الرسم (فلات/نسبة) وقيمته الجديدة.
        admin_user: المدير الذي ينفّذ التعديل.

    Returns:
        ShipBookingFeeSetting: الإعداد بعد التحديث.
    """
    setting = get_current_fee_setting(db)
    setting.fee_type = payload.fee_type
    setting.fee_value = payload.fee_value
    setting.updated_by = admin_user.id
    setting.updated_at = datetime.now(timezone.utc)

    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="update_ship_booking_fee_setting",
        details={"fee_type": payload.fee_type.value, "fee_value": str(payload.fee_value)},
    )
    db.commit()
    db.refresh(setting)
    return setting


def calculate_route_quote(db: Session, route: ShipRoute, adults: int, children: int, infants: int) -> ShipRouteQuoteOut:
    """
    يحسب تفصيل سعر حجز كامل لخط باخرة: السعر الحقيقي (يبقى كما ضبطه
    المدير تماماً) زائد رسم الحجز الحالي، مع تطبيق خصم "تذاكر بواخر"
    الساري -إن وُجد- على الرسم فقط.

    Args:
        db: جلسة قاعدة البيانات.
        route: خط الباخرة المطلوب حجزه.
        adults: عدد البالغين.
        children: عدد الأطفال.
        infants: عدد الرضّع.

    Returns:
        ShipRouteQuoteOut: تفصيل السعر الكامل.
    """
    base_subtotal = (
        route.adult_price_usd * adults + route.child_price_usd * children + route.infant_price_usd * infants
    ).quantize(Decimal("0.01"))

    fee_setting = get_current_fee_setting(db)
    fee_amount = flight_booking_service.calculate_fee_amount(base_subtotal, fee_setting)

    discount_percentage = service_service.get_ticket_discount_percentage(db, ServiceCategory.ship_ticket)
    if discount_percentage:
        fee_after_discount = (fee_amount * (Decimal("1") - discount_percentage / Decimal("100"))).quantize(
            Decimal("0.01")
        )
    else:
        fee_after_discount = fee_amount

    return ShipRouteQuoteOut(
        base_subtotal_usd=base_subtotal,
        fee_amount_usd=fee_amount,
        discount_percentage=discount_percentage,
        fee_after_discount_usd=fee_after_discount,
        total_price_usd=base_subtotal + fee_after_discount,
    )
