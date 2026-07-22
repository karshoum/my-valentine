from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import PaymentMode


class AgentCreateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr | None = None
    phone: str = Field(min_length=6, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    agency_name: str = Field(min_length=2, max_length=100)
    payment_mode: PaymentMode
    credit_limit: Decimal = Decimal("0.00")
    discount_rate: Decimal = Decimal("0.00")


class AgentUpdateRequest(BaseModel):
    payment_mode: PaymentMode | None = None
    credit_limit: Decimal | None = None
    discount_rate: Decimal | None = None


class AgentOut(BaseModel):
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
    amount: Decimal = Field(gt=0)
    notes: str | None = None


class CustomRateCreateRequest(BaseModel):
    service_id: int
    custom_price_usd: Decimal = Field(gt=0)


class CustomRateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    agent_id: int
    service_id: int
    custom_price_usd: Decimal
