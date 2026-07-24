# File: app/schemas/ship_booking_fee.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import FlightBookingFeeType


class ShipBookingFeeSettingOut(BaseModel):
    """تمثيل إعداد رسم حجز تذاكر البواخر الحالي في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    fee_type: FlightBookingFeeType
    fee_value: Decimal
    updated_at: datetime | None


class ShipBookingFeeUpdateRequest(BaseModel):
    """طلب تحديث رسم حجز تذاكر البواخر (admin فقط)."""

    fee_type: FlightBookingFeeType
    fee_value: Decimal = Field(ge=0)


class ShipRouteQuoteOut(BaseModel):
    """
    تفصيل سعر حجز باخرة لعدد مسافرين مُحدَّد: السعر الحقيقي (يبقى كما
    ضبطه المدير دائماً)، رسم الحجز قبل وبعد أي خصم ساري، والسعر الإجمالي
    النهائي.
    """

    base_subtotal_usd: Decimal
    fee_amount_usd: Decimal
    discount_percentage: Decimal | None
    fee_after_discount_usd: Decimal
    total_price_usd: Decimal
