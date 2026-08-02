# File: tests/test_order_flight_booking.py

"""اختبارات إنشاء طلب لخدمة تذاكر طيران/بواخر: بيانات الرحلة إلزامية، والسعر يُحسب من السعر الحقيقي + الرسوم."""

from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.models.enums import FlightBookingFeeType
from app.models.service import Service
from app.schemas.flight_booking import FlightBookingCreateRequest, FlightBookingFeeUpdateRequest
from app.schemas.order import OrderCreateRequest, OrderPassengerIn
from app.services import flight_booking_service, order_service


@pytest.fixture()
def flight_service(db_session):
    """ينشئ خدمة تذاكر طيران عامة (بلا سعر أساسي ثابت - السعر يأتي من بيانات الرحلة المختارة)."""
    service = Service(category="flight", title="تذاكر طيران", base_price_usd=0, is_active=True)
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return service


def _flight_booking_payload(base_fare_usd: Decimal = Decimal("340.00")) -> FlightBookingCreateRequest:
    return FlightBookingCreateRequest(
        origin="dmm",
        destination="ist",
        departure_date="2026-08-01",
        airline_name="TURKISH AIRLINES",
        base_fare_usd=base_fare_usd,
    )


def test_flight_category_order_requires_flight_booking(db_session, usd_currency, customer_user, flight_service):
    payload = OrderCreateRequest(
        service_id=flight_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="محمد أحمد")],
    )

    with pytest.raises(AppException) as exc_info:
        order_service.create_order(db_session, customer_user, payload)
    assert exc_info.value.status_code == 400


def test_non_flight_category_rejects_flight_booking(db_session, usd_currency, customer_user, sample_service):
    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="محمد أحمد")],
        flight_booking=_flight_booking_payload(),
    )

    with pytest.raises(AppException) as exc_info:
        order_service.create_order(db_session, customer_user, payload)
    assert exc_info.value.status_code == 400


def test_flight_order_total_is_base_fare_plus_flat_fee(db_session, usd_currency, customer_user, admin_user, flight_service):
    flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("15")),
        admin_user,
    )
    payload = OrderCreateRequest(
        service_id=flight_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="محمد أحمد")],
        flight_booking=_flight_booking_payload(Decimal("340.00")),
    )

    order = order_service.create_order(db_session, customer_user, payload)

    assert order.total_amount == Decimal("355.00")
    assert order.contact_whatsapp == "0911112222"
    detail = order.flight_booking_detail
    assert detail is not None
    assert detail.origin == "DMM"
    assert detail.destination == "IST"
    assert detail.airline_name == "TURKISH AIRLINES"
    assert detail.base_fare_usd == Decimal("340.00")
    assert detail.fee_amount_usd == Decimal("15.00")


def test_flight_order_total_is_base_fare_plus_percentage_fee(db_session, usd_currency, customer_user, admin_user, flight_service):
    flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.percentage, fee_value=Decimal("10")),
        admin_user,
    )
    payload = OrderCreateRequest(
        service_id=flight_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="محمد أحمد")],
        flight_booking=_flight_booking_payload(Decimal("200.00")),
    )

    order = order_service.create_order(db_session, customer_user, payload)

    assert order.total_amount == Decimal("220.00")
    assert order.flight_booking_detail.fee_amount_usd == Decimal("20.00")
