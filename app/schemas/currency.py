# File: app/schemas/currency.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CurrencyCreateRequest(BaseModel):
    """بيانات إضافة عملة جديدة إلى النظام (بصلاحية admin فقط)."""

    code: str = Field(min_length=2, max_length=5)
    name: str = Field(min_length=2, max_length=50)
    rate_to_usd: Decimal = Field(gt=0)


class CurrencyManualUpdateRequest(BaseModel):
    """طلب التحديث اليدوي الحصري لسعر صرف عملة مقابل الدولار."""

    rate_to_usd: Decimal = Field(gt=0, description="سعر الوحدة مقابل الدولار الأمريكي")


class CurrencyOut(BaseModel):
    """تمثيل عملة كاملاً في الاستجابات، بما يشمل من ومتى حدّث سعرها."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    rate_to_usd: Decimal
    is_manual: bool
    updated_by: int | None
    updated_at: datetime
