from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ServiceCategory


class VisaResidencyDetailIn(BaseModel):
    country: str = Field(max_length=50)
    type: str = Field(max_length=50)
    requirements: str | None = None
    processing_time: str | None = None
    is_dynamic_price: bool = False


class VisaResidencyDetailOut(VisaResidencyDetailIn):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int


class ServiceCreateRequest(BaseModel):
    category: ServiceCategory
    title: str = Field(min_length=2, max_length=150)
    description: str | None = None
    base_price_usd: Decimal = Field(gt=0)
    visa_residency_detail: VisaResidencyDetailIn | None = None


class ServiceUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    base_price_usd: Decimal | None = None
    is_active: bool | None = None


class ServiceOut(BaseModel):
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
    service_id: int
    title: str
    currency_code: str
    price: Decimal
