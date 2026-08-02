# File: app/integrations/duffel_client.py

"""
عميل بسيط لـ Duffel (Offer Requests API) — يُستخدَم فقط لعرض رحلات
وأسعار حقيقية للعميل عند البحث؛ الحجز الفعلي (إصدار التذكرة) يبقى
يدوياً خارج النظام كما هو معمول به حالياً.

اختير Duffel بديلاً لـ Amadeus for Developers بعد أن أوقفت Amadeus
باب التسجيل الذاتي المجاني لمنصتها (يوليو 2026).
"""

from datetime import date
from typing import Any

import requests

from app.core.config import settings
from app.core.exceptions import AppException

_OFFER_REQUESTS_PATH = "/air/offer_requests"


def search_flight_offers(
    origin: str,
    destination: str,
    departure_date: date,
    return_date: date | None,
    adults: int,
    children: int = 0,
    infants: int = 0,
) -> dict[str, Any]:
    """
    يبحث عن عروض رحلات طيران حقيقية بين مدينتين عبر Duffel Offer
    Requests API، ويطلب إعادة العروض مباشرة ضمن نفس الاستجابة.

    Args:
        origin: رمز مطار الانطلاق (IATA، مثال: DMM).
        destination: رمز مطار الوصول (IATA، مثال: IST).
        departure_date: تاريخ الذهاب.
        return_date: تاريخ العودة (اختياري، رحلة ذهاب فقط إذا None).
        adults: عدد المسافرين البالغين.
        children: عدد الأطفال (2-11 سنة).
        infants: عدد الرضّع (أقل من سنتين).

    Returns:
        dict: استجابة Duffel الخام لكائن Offer Request.

    Raises:
        AppException: 503 إذا لم تُضبَط بيانات الاعتماد، أو 502 إذا فشل
        الاتصال بمزوّد الخدمة.
    """
    if not settings.DUFFEL_API_KEY:
        raise AppException("بحث حجوزات الطيران غير مُفعَّل بعد على هذا الخادم", status_code=503)

    slices = [
        {"origin": origin.upper(), "destination": destination.upper(), "departure_date": departure_date.isoformat()}
    ]
    if return_date:
        slices.append(
            {
                "origin": destination.upper(),
                "destination": origin.upper(),
                "departure_date": return_date.isoformat(),
            }
        )

    passengers: list[dict[str, str]] = [{"type": "adult"} for _ in range(adults)]
    passengers.extend({"type": "child"} for _ in range(children))
    passengers.extend({"type": "infant_without_seat"} for _ in range(infants))

    try:
        response = requests.post(
            f"{settings.DUFFEL_BASE_URL}{_OFFER_REQUESTS_PATH}",
            params={"return_offers": "true"},
            json={
                "data": {
                    "slices": slices,
                    "passengers": passengers,
                    "cabin_class": "economy",
                }
            },
            headers={
                "Authorization": f"Bearer {settings.DUFFEL_API_KEY}",
                "Duffel-Version": settings.DUFFEL_VERSION,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=20,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as error:
        raise AppException(
            "تعذّر جلب نتائج البحث من مزوّد بيانات الطيران، حاول مرة أخرى لاحقاً", status_code=502
        ) from error
