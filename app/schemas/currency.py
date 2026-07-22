from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CurrencyCreateRequest(BaseModel):
    code: str = Field(min_length=2, max_length=5)
    name: str = Field(min_length=2, max_length=50)
    rate_to_usd: Decimal = Field(gt=0)


class CurrencyManualUpdateRequest(BaseModel):
    rate_to_usd: Decimal = Field(gt=0, description="سعر الوحدة مقابل الدولار الأمريكي")


class CurrencyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    rate_to_usd: Decimal
    is_manual: bool
    updated_by: int | None
    updated_at: datetime
