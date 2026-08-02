# File: app/schemas/flight_booking.py

from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FlightBookingFeeType


class FlightOfferOut(BaseModel):
    """عرض رحلة طيران/باخرة واحد، مع الرسوم الحالية مُضافة على السعر الحقيقي."""

    airline_code: str
    airline_name: str
    origin: str
    destination: str
    departure_at: datetime
    arrival_at: datetime
    stops: int
    duration_minutes: int
    base_fare_usd: Decimal
    fee_amount_usd: Decimal
    total_price_usd: Decimal


class FlightBookingFeeSettingOut(BaseModel):
    """تمثيل إعداد رسوم حجز الطيران الحالي في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    fee_type: FlightBookingFeeType
    fee_value: Decimal
    updated_at: datetime | None


class FlightBookingFeeUpdateRequest(BaseModel):
    """طلب تحديث رسوم حجز الطيران (admin فقط)."""

    fee_type: FlightBookingFeeType
    fee_value: Decimal = Field(ge=0)


class FlightBookingCreateRequest(BaseModel):
    """
    بيانات الرحلة المختارة عند إنشاء طلب من نوع تذاكر طيران/بواخر —
    تُرسَل كما ظهرت في نتيجة البحث (المسار، التواريخ، شركة الطيران،
    والسعر الحقيقي قبل الرسوم).
    """

    origin: str = Field(min_length=3, max_length=10)
    destination: str = Field(min_length=3, max_length=10)
    departure_date: date
    return_date: date | None = None
    airline_name: str = Field(min_length=2, max_length=100)
    base_fare_usd: Decimal = Field(gt=0)


class FlightBookingDetailOut(BaseModel):
    """تمثيل تفاصيل رحلة مرتبطة بطلب في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    origin: str
    destination: str
    departure_date: date
    return_date: date | None
    airline_name: str
    base_fare_usd: Decimal
    fee_amount_usd: Decimal
