# File: app/services/flight_search_service.py

"""
تحويل استجابة Duffel Offer Requests الخام إلى قائمة عروض واضحة
(FlightOfferOut)، مع تطبيق رسم حجز الطيران الحالي على كل سعر حقيقي.

ملاحظة مهمة: Duffel يُسعّر كل عرض بعملة قد تختلف حسب شركة الطيران
والمسار (USD/GBP/EUR...)، بينما كل حسابات المنصة الداخلية بالدولار
حصراً؛ لذا يُستبعَد أي عرض غير مُسعَّر بالدولار صراحة، تفادياً لمعاملة
مبلغ بعملة أخرى كأنه دولار.
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.integrations import duffel_client
from app.schemas.flight_booking import FlightOfferOut
from app.services import flight_booking_service

_USD_CODE = "USD"


def _duration_minutes_from_segments(segments: list[dict]) -> int:
    """يحسب مدة الرحلة بالدقائق من فارق وقتي إقلاع أول قطعة ووصول آخر قطعة."""
    departs_at = datetime.fromisoformat(segments[0]["departing_at"])
    arrives_at = datetime.fromisoformat(segments[-1]["arriving_at"])
    return int((arrives_at - departs_at).total_seconds() // 60)


def _parse_offer(raw_offer: dict, fee_setting) -> FlightOfferOut | None:
    """يحوّل عرضاً واحداً من استجابة Duffel الخام إلى FlightOfferOut، أو None إذا لم يكن مُسعَّراً بالدولار."""
    if raw_offer["total_currency"] != _USD_CODE:
        return None

    outbound_segments = raw_offer["slices"][0]["segments"]
    first_segment = outbound_segments[0]
    last_segment = outbound_segments[-1]
    carrier = first_segment["operating_carrier"]

    base_fare_usd = Decimal(raw_offer["total_amount"])
    fee_amount_usd = flight_booking_service.calculate_fee_amount(base_fare_usd, fee_setting)

    return FlightOfferOut(
        airline_code=carrier["iata_code"],
        airline_name=carrier["name"],
        origin=first_segment["origin"]["iata_code"],
        destination=last_segment["destination"]["iata_code"],
        departure_at=first_segment["departing_at"],
        arrival_at=last_segment["arriving_at"],
        stops=len(outbound_segments) - 1,
        duration_minutes=_duration_minutes_from_segments(outbound_segments),
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
    الحالي على سعر كل رحلة (العروض غير المُسعَّرة بالدولار تُستبعَد).

    Args:
        db: جلسة قاعدة البيانات (لجلب إعداد الرسوم الحالي).
        origin: رمز مطار الانطلاق (IATA).
        destination: رمز مطار الوصول (IATA).
        departure_date: تاريخ الذهاب.
        return_date: تاريخ العودة (اختياري).
        adults: عدد المسافرين البالغين.

    Returns:
        list[FlightOfferOut]: عروض الرحلات المتاحة المُسعَّرة بالدولار، كما وردت من المزوّد.
    """
    fee_setting = flight_booking_service.get_current_fee_setting(db)
    raw_response = duffel_client.search_flight_offers(origin, destination, departure_date, return_date, adults)

    parsed_offers = (_parse_offer(raw_offer, fee_setting) for raw_offer in raw_response.get("data", {}).get("offers", []))
    return [offer for offer in parsed_offers if offer is not None]
