from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import RefundStatus


class RefundCreateRequest(BaseModel):
    refund_amount: Decimal = Field(gt=0)
    currency_code: str | None = None
    reason: str | None = None


class RefundDecisionRequest(BaseModel):
    notes: str | None = None


class RefundOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    refund_amount: Decimal
    currency_code: str | None
    reason: str | None
    status: RefundStatus
    processed_by: int | None
    processed_at: datetime | None
