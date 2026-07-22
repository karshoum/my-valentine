from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OrderStatus


class OrderPassengerIn(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    passport_number: str | None = None


class OrderPassengerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    passport_number: str | None
    passport_file_url: str | None


class OrderCreateRequest(BaseModel):
    service_id: int
    currency_code: str = Field(min_length=2, max_length=5)
    passengers: list[OrderPassengerIn] = Field(min_length=1)


class OrderStatusUpdateRequest(BaseModel):
    new_status: OrderStatus
    notes: str | None = None


class OrderStatusLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    old_status: OrderStatus | None
    new_status: OrderStatus
    changed_by: int
    notes: str | None
    created_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    user_id: int
    service_id: int
    total_amount: Decimal
    currency_code: str
    status: OrderStatus
    created_at: datetime
    passengers: list[OrderPassengerOut] = []
    status_logs: list[OrderStatusLogOut] = []
