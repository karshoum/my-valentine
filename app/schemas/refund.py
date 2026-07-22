# File: app/schemas/refund.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RefundStatus


class RefundCreateRequest(BaseModel):
    """بيانات طلب استرداد جديد لطلب موجود."""

    refund_amount: Decimal = Field(gt=0)
    currency_code: str | None = None
    reason: str | None = None


class RefundDecisionRequest(BaseModel):
    """ملاحظة اختيارية ترافق قرار رفض طلب استرداد."""

    notes: str | None = None


class RefundOut(BaseModel):
    """تمثيل طلب استرداد كامل في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    refund_amount: Decimal
    currency_code: str | None
    reason: str | None
    status: RefundStatus
    processed_by: int | None
    processed_at: datetime | None
