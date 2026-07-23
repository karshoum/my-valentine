# File: app/schemas/payment.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import PaymentMethod, PaymentStatus


class PaymentSubmitRequest(BaseModel):
    """بيانات رفع إثبات دفع (بنكك/فيزا) من العميل أو الوكيل."""

    payment_method: PaymentMethod
    amount: Decimal
    currency_code: str | None = None
    transaction_ref: str | None = None


class PaymentVerifyRequest(BaseModel):
    """قرار موظف/مدير بعد مراجعة إثبات الدفع: قبول أو رفض."""

    approve: bool
    notes: str | None = None


class PaymentOut(BaseModel):
    """تمثيل سجل دفع كامل في الاستجابات، مع رابط موقّت لصورة إشعار الدفع."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    order_number: str
    payment_method: PaymentMethod
    amount: Decimal
    currency_code: str | None
    transaction_ref: str | None
    receipt_signed_url: str | None
    status: PaymentStatus
    verified_by: int | None
    verified_at: datetime | None
    created_at: datetime
