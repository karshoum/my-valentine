# File: app/services/flight_search_service.py

"""
تحويل استجابة Amadeus Flight Offers Search الخام إلى قائمة عروض واضحة
(FlightOfferOut)، مع تطبيق رسم حجز الطيران الحالي على كل سعر حقيقي.
"""

import re
from datetime import date
from decimal import Decimal

from sqlalchemy.orm import Session

from app.integrations import amadeus_client
from app.schemas.flight_booking import FlightOfferOut
from app.services import flight_booking_service

_DURATION_PATTERN = re.compile(r"PT(?:(\d+)H)?(?:(\d+)M)?")


def _parse_duration_to_minutes(iso8601_duration: str) -> int:
    """يحوّل مدة بصيغة ISO 8601 (مثال: 'PT9H30M') إلى عدد دقائق صحيح."""
    match = _DURATION_PATTERN.match(iso8601_duration)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    return hours * 60 + minutes


def _parse_offer(raw_offer: dict, carrier_names: dict[str, str], fee_setting) -> FlightOfferOut:
    """يحوّل عرضاً واحداً من استجابة Amadeus الخام إلى FlightOfferOut، مع الرسم مُضافاً."""
    outbound_itinerary = raw_offer["itineraries"][0]
    segments = outbound_itinerary["segments"]
    first_segment = segments[0]
    last_segment = segments[-1]

    base_fare_usd = Decimal(raw_offer["price"]["grandTotal"])
    fee_amount_usd = flight_booking_service.calculate_fee_amount(base_fare_usd, fee_setting)
    carrier_code = first_segment["carrierCode"]

    return FlightOfferOut(
        airline_code=carrier_code,
        airline_name=carrier_names.get(carrier_code, carrier_code),
        origin=first_segment["departure"]["iataCode"],
        destination=last_segment["arrival"]["iataCode"],
        departure_at=first_segment["departure"]["at"],
        arrival_at=last_segment["arrival"]["at"],
        stops=len(segments) - 1,
        duration_minutes=_parse_duration_to_minutes(outbound_itinerary["duration"]),
        base_fare_usd=base_fare_usd,
        fee_amount_usd=fee_amount_usd,
        total_price_usd=base_fare_usd + fee_amount_usd,
    )


def search_flights(
    db: Session,
    origin: str,
    destination: str,
    departure_date: date,
    return_date: date | None,
    adults: int,
) -> list[FlightOfferOut]:
    """
    يبحث عن رحلات حقيقية بين مدينتين ويُعيدها مع تطبيق رسم حجز الطيران
    الحالي على سعر كل رحلة.

    Args:
        db: جلسة قاعدة البيانات (لجلب إعداد الرسوم الحالي).
        origin: رمز مطار الانطلاق (IATA).
        destination: رمز مطار الوصول (IATA).
        departure_date: تاريخ الذهاب.
        return_date: تاريخ العودة (اختياري).
        adults: عدد المسافرين البالغين.

    Returns:
        list[FlightOfferOut]: عروض الرحلات المتاحة، مرتبة كما وردت من المزوّد.
    """
    fee_setting = flight_booking_service.get_current_fee_setting(db)
    raw_response = amadeus_client.search_flight_offers(origin, destination, departure_date, return_date, adults)

    carrier_names: dict[str, str] = raw_response.get("dictionaries", {}).get("carriers", {})
    return [_parse_offer(raw_offer, carrier_names, fee_setting) for raw_offer in raw_response.get("data", [])]
