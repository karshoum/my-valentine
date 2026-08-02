# File: app/schemas/agent.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import PaymentMode


class AgentPromoteRequest(BaseModel):
    """بيانات ترقية حساب عميل عادي موجود مسبقاً إلى وكيل B2B (بصلاحية admin فقط)."""

    user_id: int
    agency_name: str = Field(min_length=2, max_length=100)
    payment_mode: PaymentMode
    credit_limit: Decimal = Decimal("0.00")
    discount_rate: Decimal = Decimal("0.00")


class AgentUpdateRequest(BaseModel):
    """حقول ملف الوكيل القابلة للتعديل الجزئي (كلها اختيارية)."""

    payment_mode: PaymentMode | None = None
    credit_limit: Decimal | None = None
    discount_rate: Decimal | None = None


class AgentOut(BaseModel):
    """تمثيل ملف وكيل B2B كاملاً في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    agency_name: str
    payment_mode: PaymentMode
    wallet_balance: Decimal
    credit_limit: Decimal
    discount_rate: Decimal
    created_at: datetime


class WalletDepositRequest(BaseModel):
    """طلب إيداع مبلغ في محفظة وكيل (بصلاحية موظف/مدير)."""

    amount: Decimal = Field(gt=0)
    notes: str | None = None


class CustomRateCreateRequest(BaseModel):
    """طلب تحديد/تحديث سعر خاص لخدمة معينة لوكيل محدد."""

    service_id: int
    custom_price_usd: Decimal = Field(gt=0)


class CustomRateOut(BaseModel):
    """تمثيل سعر B2B خاص في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    agent_id: int
    service_id: int
    custom_price_usd: Decimal
