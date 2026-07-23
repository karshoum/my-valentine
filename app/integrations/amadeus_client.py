# File: app/integrations/amadeus_client.py

"""
عميل بسيط لـ Amadeus for Developers (Flight Offers Search API) —
يُستخدَم فقط لعرض رحلات وأسعار حقيقية للعميل عند البحث؛ الحجز الفعلي
(إصدار التذكرة) يبقى يدوياً خارج النظام كما هو معمول به حالياً.

القيود المعروفة: توكن الوصول مخزَّن في ذاكرة العملية (in-memory) فقط،
فلا يصلح لنشر متعدد النسخ بدون مشاركة الحالة - كافٍ للنشر بنسخة واحدة
(الوضع الحالي للمشروع، نفس قيد app/core/rate_limit.py).
"""

import time
from datetime import date
from typing import Any

import requests

from app.core.config import settings
from app.core.exceptions import AppException

_TOKEN_URL_PATH = "/v1/security/oauth2/token"
_FLIGHT_OFFERS_PATH = "/v2/shopping/flight-offers"
_TOKEN_EXPIRY_SAFETY_MARGIN_SECONDS = 30

_cached_access_token: str | None = None
_cached_token_expires_at: float = 0.0


def _get_access_token() -> str:
    """
    يُعيد توكن وصول Amadeus صالحاً، من الذاكرة المخزَّنة أو بطلب جديد.

    Returns:
        str: توكن OAuth2 صالح للاستخدام في ترويسة Authorization.

    Raises:
        AppException: 503 إذا لم تُضبَط بيانات اعتماد Amadeus بعد، أو
        502 إذا فشل طلب التوكن من مزوّد الخدمة.
    """
    global _cached_access_token, _cached_token_expires_at

    if not settings.AMADEUS_API_KEY or not settings.AMADEUS_API_SECRET:
        raise AppException("بحث حجوزات الطيران غير مُفعَّل بعد على هذا الخادم", status_code=503)

    if _cached_access_token and time.time() < _cached_token_expires_at:
        return _cached_access_token

    try:
        response = requests.post(
            f"{settings.AMADEUS_BASE_URL}{_TOKEN_URL_PATH}",
            data={
                "grant_type": "client_credentials",
                "client_id": settings.AMADEUS_API_KEY,
                "client_secret": settings.AMADEUS_API_SECRET,
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as error:
        raise AppException(
            "تعذّر الاتصال بمزوّد بيانات الطيران، حاول مرة أخرى لاحقاً", status_code=502
        ) from error

    _cached_access_token = payload["access_token"]
    _cached_token_expires_at = time.time() + payload["expires_in"] - _TOKEN_EXPIRY_SAFETY_MARGIN_SECONDS
    return _cached_access_token


def search_flight_offers(
    origin: str,
    destination: str,
    departure_date: date,
    return_date: date | None,
    adults: int,
) -> dict[str, Any]:
    """
    يبحث عن عروض رحلات طيران حقيقية بين مدينتين عبر Amadeus Flight
    Offers Search API.

    Args:
        origin: رمز مطار/مدينة الانطلاق (IATA، مثال: DMM).
        destination: رمز مطار/مدينة الوصول (IATA، مثال: IST).
        departure_date: تاريخ الذهاب.
        return_date: تاريخ العودة (اختياري، رحلة ذهاب فقط إذا None).
        adults: عدد المسافرين البالغين.

    Returns:
        dict: استجابة Amadeus الخام (يحتوي "data" لعروض الرحلات و
        "dictionaries" لأسماء شركات الطيران).

    Raises:
        AppException: 503 إذا لم تُضبَط بيانات الاعتماد، أو 502 إذا فشل
        الاتصال بمزوّد الخدمة.
    """
    access_token = _get_access_token()

    query_params = {
        "originLocationCode": origin.upper(),
        "destinationLocationCode": destination.upper(),
        "departureDate": departure_date.isoformat(),
        "adults": adults,
        "currencyCode": "USD",
        "max": 15,
    }
    if return_date:
        query_params["returnDate"] = return_date.isoformat()

    try:
        response = requests.get(
            f"{settings.AMADEUS_BASE_URL}{_FLIGHT_OFFERS_PATH}",
            params=query_params,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as error:
        raise AppException(
            "تعذّر جلب نتائج البحث من مزوّد بيانات الطيران، حاول مرة أخرى لاحقاً", status_code=502
        ) from error
