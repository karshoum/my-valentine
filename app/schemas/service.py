# File: app/schemas/service.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ServiceCategory


class VisaResidencyDetailIn(BaseModel):
    """تفاصيل فيزا/إقامة تُرفَق عند إنشاء خدمة من هذين النوعين."""

    country: str = Field(max_length=50)
    type: str = Field(max_length=50)
    requirements: str | None = None
    processing_time: str | None = None
    is_dynamic_price: bool = False


class VisaResidencyDetailOut(VisaResidencyDetailIn):
    """تمثيل تفاصيل الفيزا/الإقامة في الاستجابات، مع معرّفاتها."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int


class ServiceCreateRequest(BaseModel):
    """بيانات إنشاء خدمة جديدة (بصلاحية موظف/مدير)."""

    category: ServiceCategory
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None
    base_price_usd: Decimal = Field(gt=0)
    visa_residency_detail: VisaResidencyDetailIn | None = None


class ServiceUpdateRequest(BaseModel):
    """حقول الخدمة القابلة للتعديل الجزئي (كلها اختيارية)."""

    title: str | None = None
    description: str | None = None
    base_price_usd: Decimal | None = None
    is_active: bool | None = None


class ServiceOut(BaseModel):
    """تمثيل خدمة كاملة في الاستجابات، مع تفاصيل الفيزا/الإقامة إن وُجدت."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    category: ServiceCategory
    title: str
    description: str | None
    base_price_usd: Decimal
    is_active: bool
    created_at: datetime
    visa_residency_detail: VisaResidencyDetailOut | None = None


class ServicePriceOut(BaseModel):
    """سعر خدمة محسوب بعملة مستهدفة (يُستخدم في شاشات العرض)."""

    service_id: int
    title: str
    currency_code: str
    price: Decimal
