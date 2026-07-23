# File: tests/test_flight_search_service.py

"""اختبارات تحويل استجابة Amadeus الخام إلى عروض رحلات واضحة، مع تطبيق رسم الحجز."""

from datetime import date
from decimal import Decimal

from app.models.enums import FlightBookingFeeType
from app.schemas.flight_booking import FlightBookingFeeUpdateRequest
from app.services import flight_booking_service, flight_search_service

_FAKE_AMADEUS_RESPONSE = {
    "data": [
        {
            "price": {"grandTotal": "340.00", "currency": "USD"},
            "itineraries": [
                {
                    "duration": "PT9H30M",
                    "segments": [
                        {
                            "departure": {"iataCode": "DMM", "at": "2026-08-01T10:00:00"},
                            "arrival": {"iataCode": "IST", "at": "2026-08-01T15:30:00"},
                            "carrierCode": "TK",
                        }
                    ],
                }
            ],
        },
        {
            "price": {"grandTotal": "410.50", "currency": "USD"},
            "itineraries": [
                {
                    "duration": "PT14H15M",
                    "segments": [
                        {
                            "departure": {"iataCode": "DMM", "at": "2026-08-01T08:00:00"},
                            "arrival": {"iataCode": "CAI", "at": "2026-08-01T11:00:00"},
                            "carrierCode": "MS",
                        },
                        {
                            "departure": {"iataCode": "CAI", "at": "2026-08-01T13:00:00"},
                            "arrival": {"iataCode": "IST", "at": "2026-08-01T22:15:00"},
                            "carrierCode": "MS",
                        },
                    ],
                }
            ],
        },
    ],
    "dictionaries": {"carriers": {"TK": "TURKISH AIRLINES", "MS": "EGYPTAIR"}},
}


def test_search_flights_parses_direct_and_connecting_offers(db_session, admin_user, monkeypatch):
    flight_booking_service.update_fee_setting(
        db_session,
        FlightBookingFeeUpdateRequest(fee_type=FlightBookingFeeType.flat, fee_value=Decimal("15")),
        admin_user,
    )
    monkeypatch.setattr(
        flight_search_service.amadeus_client,
        "search_flight_offers",
        lambda *args, **kwargs: _FAKE_AMADEUS_RESPONSE,
    )

    offers = flight_search_service.search_flights(db_session, "dmm", "ist", date(2026, 8, 1), None, 1)

    assert len(offers) == 2

    direct_offer = offers[0]
    assert direct_offer.airline_code == "TK"
    assert direct_offer.airline_name == "TURKISH AIRLINES"
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


def test_unknown_carrier_code_falls_back_to_code_itself(db_session, monkeypatch):
    response = {
        "data": [
            {
                "price": {"grandTotal": "100.00", "currency": "USD"},
                "itineraries": [
                    {
                        "duration": "PT2H0M",
                        "segments": [
                            {
                                "departure": {"iataCode": "DMM", "at": "2026-08-01T10:00:00"},
                                "arrival": {"iataCode": "RUH", "at": "2026-08-01T12:00:00"},
                                "carrierCode": "XX",
                            }
                        ],
                    }
                ],
            }
        ],
        "dictionaries": {"carriers": {}},
    }
    monkeypatch.setattr(flight_search_service.amadeus_client, "search_flight_offers", lambda *a, **k: response)

    offers = flight_search_service.search_flights(db_session, "DMM", "RUH", date(2026, 8, 1), None, 1)

    assert offers[0].airline_name == "XX"
