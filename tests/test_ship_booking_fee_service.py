# File: tests/test_ship_booking_fee_service.py

"""اختبارات إعداد رسم حجز البواخر (فلات/نسبة) وحساب تفصيل سعر حجز كامل مع الخصم."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from app.models.enums import FlightBookingFeeType
from app.models.service import Service
from app.models.ship_route import ShipRoute
from app.schemas.ship_booking_fee import ShipBookingFeeUpdateRequest
from app.services import ship_booking_fee_service


def _make_route(db_session) -> ShipRoute:
    route = ShipRoute(
        origin_city="بورتسودان",
        destination_city="جدة",
        adult_price_usd=Decimal("100"),
        child_price_usd=Decimal("60"),
        infant_price_usd=Decimal("0"),
    )
    db_session.add(route)
    db_session.commit()
    db_session.refresh(route)
    return route


def test_get_current_fee_setting_creates_default_row_once(db_session):
    first_call = ship_booking_fee_service.get_current_fee_setting(db_session)
    second_call = ship_booking_fee_service.get_current_fee_setting(db_session)

    assert first_call.fee_type == FlightBookingFeeType.flat
    assert first_call.fee_value == Decimal("0")
    assert first_call.id == second_call.id


def test_update_fee_setting_admin_only_fields_persist(db_session, admin_user):
    updated = ship_booking_fee_service.update_fee_setting(
        db_session,
        ShipBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("10")),
        admin_user,
    )

    assert updated.fee_type == FlightBookingFeeType.flat
    assert updated.fee_value == Decimal("10")
    assert updated.updated_by == admin_user.id


def test_calculate_route_quote_with_zero_fee_keeps_real_price(db_session):
    route = _make_route(db_session)

    quote = ship_booking_fee_service.calculate_route_quote(db_session, route, adults=2, children=1, infants=0)

    assert quote.base_subtotal_usd == Decimal("260.00")  # 100*2 + 60*1
    assert quote.fee_amount_usd == Decimal("0.00")
    assert quote.discount_percentage is None
    assert quote.total_price_usd == Decimal("260.00")


def test_calculate_route_quote_adds_fee_on_top_of_real_price(db_session, admin_user):
    route = _make_route(db_session)
    ship_booking_fee_service.update_fee_setting(
        db_session,
        ShipBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("15")),
        admin_user,
    )

    quote = ship_booking_fee_service.calculate_route_quote(db_session, route, adults=1, children=0, infants=0)

    assert quote.base_subtotal_usd == Decimal("100.00")
    assert quote.fee_amount_usd == Decimal("15.00")
    assert quote.total_price_usd == Decimal("115.00")


def test_active_ticket_discount_reduces_fee_only_not_real_route_price(db_session, admin_user):
    route = _make_route(db_session)
    ship_booking_fee_service.update_fee_setting(
        db_session,
        ShipBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("20")),
        admin_user,
    )
    ticket_service = Service(
        category="ship_ticket",
        title="تذاكر بواخر",
        base_price_usd=Decimal("0"),
        is_active=True,
        discount_percentage=Decimal("50"),
        discount_valid_until=datetime.now(timezone.utc) + timedelta(days=1),
    )
    db_session.add(ticket_service)
    db_session.commit()

    quote = ship_booking_fee_service.calculate_route_quote(db_session, route, adults=1, children=0, infants=0)

    assert quote.base_subtotal_usd == Decimal("100.00")  # السعر الحقيقي لم يتغيّر
    assert quote.fee_amount_usd == Decimal("20.00")
    assert quote.discount_percentage == Decimal("50")
    assert quote.fee_after_discount_usd == Decimal("10.00")  # نصف الرسم فقط
    assert quote.total_price_usd == Decimal("110.00")
