from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import LeadServiceType


class LeadCreateRequest(BaseModel):
    service_type: LeadServiceType
    customer_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=6, max_length=20)
    details: str | None = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_type: LeadServiceType
    customer_name: str
    phone: str
    details: str | None
    created_at: datetime
