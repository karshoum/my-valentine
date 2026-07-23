# File: app/schemas/service.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

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


class ServiceDiscountUpdateRequest(BaseModel):
    """
    طلب تحديد أو إلغاء عرض خصم محدود المدة على خدمة (admin فقط).

    لتفعيل عرض: أرسل النسبة وتاريخ الانتهاء معاً. لإلغاء عرض قائم: أرسل
    القيمتين كـ null معاً. أي مزيج آخر (نسبة بلا تاريخ انتهاء أو العكس)
    يُرفض لتفادي عرض بلا تاريخ نهاية واضح.
    """

    discount_percentage: Decimal | None = Field(default=None, ge=0, le=100)
    discount_valid_until: datetime | None = None

    @model_validator(mode="after")
    def _both_or_neither(self) -> "ServiceDiscountUpdateRequest":
        """يتحقق من إرسال الحقلين معاً أو تركهما فارغين معاً، لا مزيجاً بينهما."""
        has_percentage = self.discount_percentage is not None
        has_expiry = self.discount_valid_until is not None
        if has_percentage != has_expiry:
            raise ValueError("يجب تحديد نسبة الخصم وتاريخ الانتهاء معاً، أو تركهما فارغين لإلغاء العرض")
        return self


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
    discount_percentage: Decimal | None
    discount_valid_until: datetime | None
    has_active_discount: bool
    effective_price_usd: Decimal
    visa_residency_detail: VisaResidencyDetailOut | None = None


class ServicePriceOut(BaseModel):
    """سعر خدمة محسوب بعملة مستهدفة (يُستخدم في شاشات العرض)."""

    service_id: int
    title: str
    currency_code: str
    price: Decimal
