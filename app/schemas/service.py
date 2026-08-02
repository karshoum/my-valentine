# File: app/schemas/service.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import ServiceCategory
from app.schemas.service_requirement import ServiceRequirementOut

_FLIGHT_BOOKING_CATEGORIES = (ServiceCategory.flight, ServiceCategory.ship_ticket)


def _validate_pinned_currency_fields(
    category: ServiceCategory | None, currency_code: str | None, amount
) -> None:
    """
    يتحقق من قاعدتي تثبيت السعر بعملة محدَّدة: الحقلان معاً أو لا شيء
    منهما، ولا يمكن تثبيت السعر لخدمات الطيران/البواخر (سعرها يُحسَب من
    عرض حجز حقيقي وقت الطلب، لا من سعر الخدمة الثابت).

    Raises:
        ValueError: إذا أُرسل حقل واحد فقط، أو أُرسلا لتصنيف طيران/بواخر.
    """
    has_currency = currency_code is not None
    has_amount = amount is not None
    if has_currency != has_amount:
        raise ValueError("يجب تحديد عملة التثبيت والسعر المثبَّت معاً، أو تركهما فارغين لإلغاء التثبيت")
    if has_currency and category in _FLIGHT_BOOKING_CATEGORIES:
        raise ValueError("لا يمكن تثبيت السعر بعملة محدَّدة لخدمات تذاكر الطيران/البواخر")


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
    pinned_currency_code: str | None = Field(default=None, min_length=2, max_length=5)
    pinned_price_amount: Decimal | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def _validate_pinned_currency(self) -> "ServiceCreateRequest":
        _validate_pinned_currency_fields(self.category, self.pinned_currency_code, self.pinned_price_amount)
        return self


class ServiceUpdateRequest(BaseModel):
    """
    حقول الخدمة القابلة للتعديل الجزئي (كلها اختيارية). تثبيت/إلغاء
    تثبيت السعر بعملة محدَّدة يتطلب إرسال pinned_currency_code
    وpinned_price_amount معاً (أو تركهما فارغين معاً)؛ يُمنع تصنيفا
    الطيران/البواخر من هذا التثبيت عند التحقق في طبقة الخدمة (لأن
    التصنيف ليس جزءاً من هذا الطلب).
    """

    title: str | None = None
    description: str | None = None
    base_price_usd: Decimal | None = None
    is_active: bool | None = None
    pinned_currency_code: str | None = Field(default=None, min_length=2, max_length=5)
    pinned_price_amount: Decimal | None = Field(default=None, gt=0)

    @model_validator(mode="after")
    def _validate_pinned_currency(self) -> "ServiceUpdateRequest":
        _validate_pinned_currency_fields(None, self.pinned_currency_code, self.pinned_price_amount)
        return self


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
    pinned_currency_code: str | None
    pinned_price_amount: Decimal | None
    effective_pinned_price_amount: Decimal | None
    visa_residency_detail: VisaResidencyDetailOut | None = None
    requirements: list[ServiceRequirementOut] = []


class ServicePriceOut(BaseModel):
    """سعر خدمة محسوب بعملة مستهدفة (يُستخدم في شاشات العرض)."""

    service_id: int
    title: str
    currency_code: str
    price: Decimal
