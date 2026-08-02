# File: tests/test_flight_search_service.py

"""اختبارات تحويل استجابة Duffel الخام إلى عروض رحلات واضحة، مع تطبيق رسم الحجز واستبعاد العروض غير المُسعَّرة بالدولار."""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal

from app.models.enums import FlightBookingFeeType
from app.models.service import Service
from app.schemas.flight_booking import FlightBookingFeeUpdateRequest
from app.services import flight_booking_service, flight_search_service

_FAKE_DUFFEL_RESPONSE = {
    "data": {
        "id": "orq_fake",
        "offers": [
            {
                "id": "off_direct",
                "total_amount": "340.00",
                "total_currency": "USD",
                "slices": [
                    {
                        "segments": [
                            {
                                "origin": {"iata_code": "DMM"},
                                "destination": {"iata_code": "IST"},
                                "departing_at": "2026-08-01T10:00:00",
                                "arriving_at": "2026-08-01T19:30:00",
                                "operating_carrier": {"iata_code": "TK", "name": "Turkish Airlines"},
                            }
                        ]
                    }
                ],
            },
            {
                "id": "off_connecting",
                "total_amount": "410.50",
                "total_currency": "USD",
                "slices": [
                    {
                        "segments": [
                            {
                                "origin": {"iata_code": "DMM"},
                                "destination": {"iata_code": "CAI"},
                                "departing_at": "2026-08-01T08:00:00",
                                "arriving_at": "2026-08-01T11:00:00",
                                "operating_carrier": {"iata_code": "MS", "name": "EGYPTAIR"},
                            },
                            {
                                "origin": {"iata_code": "CAI"},
                                "destination": {"iata_code": "IST"},
                                "departing_at": "2026-08-01T13:00:00",
                                "arriving_at": "2026-08-01T22:15:00",
                                "operating_carrier": {"iata_code": "MS", "name": "EGYPTAIR"},
                            },
                        ]
                    }
                ],
            },
            {
                "id": "off_non_usd",
                "total_amount": "300.00",
                "total_currency": "GBP",
                "slices": [
                    {
                        "segments": [
                            {
                                "origin": {"iata_code": "DMM"},
                                "destination": {"iata_code": "IST"},
                                "departing_at": "2026-08-01T09:00:00",
                                "arriving_at": "2026-08-01T18:00:00",
                                "operating_carrier": {"iata_code": "BA", "name": "British Airways"},
                            }
                        ]
                    }
                ],
            },
        ],
    }
}


def test_search_flights_parses_direct_and_connecting_offers(db_session, admin_user, monkeypatch):
    flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("15")),
        admin_user,
    )
    monkeypatch.setattr(
        flight_search_service.duffel_client,
        "search_flight_offers",
        lambda *args, **kwargs: _FAKE_DUFFEL_RESPONSE,
    )

    offers = flight_search_service.search_flights(db_session, "dmm", "ist", date(2026, 8, 1), None, 1)

    assert len(offers) == 2  # العرض الثالث بالجنيه الإسترليني مُستبعَد

    direct_offer = offers[0]
    assert direct_offer.airline_code == "TK"
    assert direct_offer.airline_name == "Turkish Airlines"
    assert direct_offer.origin == "DMM"
    assert direct_offer.destination == "IST"
    assert direct_offer.stops == 0
    assert direct_offer.duration_minutes == 9 * 60 + 30
    assert direct_offer.base_fare_usd == Decimal("340.00")
    assert direct_offer.fee_amount_usd == Decimal("15.00")
    assert direct_offer.total_price_usd == Decimal("355.00")

    connecting_offer = offers[1]
    assert connecting_offer.stops == 1
    assert connecting_offer.airline_name == "EGYPTAIR"
    assert connecting_offer.total_price_usd == Decimal("425.50")


def test_non_usd_offers_are_excluded(db_session, monkeypatch):
    monkeypatch.setattr(
        flight_search_service.duffel_client, "search_flight_offers", lambda *a, **k: _FAKE_DUFFEL_RESPONSE
    )

    offers = flight_search_service.search_flights(db_session, "DMM", "IST", date(2026, 8, 1), None, 1)

    assert all(offer.airline_code != "BA" for offer in offers)


def test_active_ticket_discount_reduces_fee_only_not_real_fare(db_session, admin_user, monkeypatch):
    flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("20")),
        admin_user,
    )
    ticket_service = Service(
        category="flight",
        title="تذاكر طيران",
        base_price_usd=Decimal("0"),
        is_active=True,
        discount_percentage=Decimal("50"),
        discount_valid_until=datetime.now(timezone.utc) + timedelta(days=1),
    )
    db_session.add(ticket_service)
    db_session.commit()
    monkeypatch.setattr(
        flight_search_service.duffel_client,
        "search_flight_offers",
        lambda *args, **kwargs: _FAKE_DUFFEL_RESPONSE,
    )

    offers = flight_search_service.search_flights(db_session, "DMM", "IST", date(2026, 8, 1), None, 1)

    direct_offer = offers[0]
    assert direct_offer.base_fare_usd == Decimal("340.00")  # السعر الحقيقي لم يتغيّر
    assert direct_offer.fee_amount_usd == Decimal("10.00")  # نصف الرسم (20 - 50%)
    assert direct_offer.total_price_usd == Decimal("350.00")


def test_search_flights_returns_empty_list_when_no_offers(db_session, monkeypatch):
    monkeypatch.setattr(
        flight_search_service.duffel_client,
        "search_flight_offers",
        lambda *a, **k: {"data": {"id": "orq_empty", "offers": []}},
    )

    offers = flight_search_service.search_flights(db_session, "DMM", "RUH", date(2026, 8, 1), None, 1)

    assert offers == []
