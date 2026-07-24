# File: app/schemas/ship_route.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ShipRouteOut(BaseModel):
    """تمثيل خط باخرة في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    origin_city: str
    destination_city: str
    adult_price_usd: Decimal
    child_price_usd: Decimal
    infant_price_usd: Decimal
    is_active: bool
    created_at: datetime


class ShipRouteCreateRequest(BaseModel):
    """طلب إنشاء خط باخرة جديد (admin فقط)."""

    origin_city: str = Field(min_length=2, max_length=100)
    destination_city: str = Field(min_length=2, max_length=100)
    adult_price_usd: Decimal = Field(ge=0)
    child_price_usd: Decimal = Field(ge=0)
    infant_price_usd: Decimal = Field(ge=0)


class ShipRouteUpdateRequest(BaseModel):
    """طلب تحديث جزئي لخط باخرة (admin فقط)."""

    origin_city: str | None = Field(None, min_length=2, max_length=100)
    destination_city: str | None = Field(None, min_length=2, max_length=100)
    adult_price_usd: Decimal | None = Field(None, ge=0)
    child_price_usd: Decimal | None = Field(None, ge=0)
    infant_price_usd: Decimal | None = Field(None, ge=0)
    is_active: bool | None = None
