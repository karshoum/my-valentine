# File: tests/test_flight_booking_service.py

"""اختبارات إعداد رسوم حجز الطيران (فلات/نسبة) وحساب الرسم على سعر تذكرة حقيقي."""

from decimal import Decimal

from app.models.enums import FlightBookingFeeType
from app.schemas.flight_booking import FlightBookingFeeUpdateRequest
from app.services import flight_booking_service


def test_get_current_fee_setting_creates_default_row_once(db_session):
    first_call = flight_booking_service.get_current_fee_setting(db_session)
    second_call = flight_booking_service.get_current_fee_setting(db_session)

    assert first_call.fee_type == FlightBookingFeeType.flat
    assert first_call.fee_value == Decimal("0")
    assert first_call.id == second_call.id


def test_update_fee_setting_switches_to_flat_fee(db_session, admin_user):
    updated = flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("15")),
        admin_user,
    )

    assert updated.fee_type == FlightBookingFeeType.flat
    assert updated.fee_value == Decimal("15")
    assert updated.updated_by == admin_user.id


def test_update_fee_setting_switches_to_percentage_fee(db_session, admin_user):
    updated = flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.percentage, fee_value=Decimal("5")),
        admin_user,
    )

    assert updated.fee_type == FlightBookingFeeType.percentage
    assert updated.fee_value == Decimal("5")


def test_calculate_fee_amount_flat(db_session, admin_user):
    setting = flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("20")),
        admin_user,
    )

    assert flight_booking_service.calculate_fee_amount(Decimal("340.00"), setting) == Decimal("20.00")


def test_calculate_fee_amount_percentage(db_session, admin_user):
    setting = flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.percentage, fee_value=Decimal("10")),
        admin_user,
    )

    assert flight_booking_service.calculate_fee_amount(Decimal("340.00"), setting) == Decimal("34.00")


def test_calculate_fee_amount_zero_fee_means_same_price(db_session):
    setting = flight_booking_service.get_current_fee_setting(db_session)

    assert flight_booking_service.calculate_fee_amount(Decimal("500.00"), setting) == Decimal("0.00")
