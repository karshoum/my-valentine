from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import PaymentMethod, PaymentStatus


class PaymentSubmitRequest(BaseModel):
    payment_method: PaymentMethod
    amount: Decimal
    currency_code: str | None = None
    transaction_ref: str | None = None


class PaymentVerifyRequest(BaseModel):
    approve: bool
    notes: str | None = None


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    payment_method: PaymentMethod
    amount: Decimal
    currency_code: str | None
    transaction_ref: str | None
    status: PaymentStatus
    verified_by: int | None
    verified_at: datetime | None
    created_at: datetime
