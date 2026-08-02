# File: app/schemas/order.py

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import OrderStatus
from app.schemas.flight_booking import FlightBookingCreateRequest, FlightBookingDetailOut
from app.schemas.refund import RefundOut


class OrderPassengerIn(BaseModel):
    """بيانات مسافر واحد تُرسَل عند إنشاء طلب."""

    full_name: str = Field(min_length=2, max_length=100)
    passport_number: str | None = None


class OrderPassengerOut(BaseModel):
    """تمثيل مسافر ضمن طلب في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    passport_number: str | None
    passport_file_url: str | None


class OrderCreateRequest(BaseModel):
    """
    بيانات إنشاء طلب جديد: الخدمة، عملة السداد، قائمة المسافرين، ورقم
    واتساب للتواصل. لخدمات تصنيف تذاكر الطيران/البواخر، يجب إرفاق
    flight_booking (الرحلة المختارة من نتائج البحث).
    """

    service_id: int
    currency_code: str = Field(min_length=2, max_length=5)
    passengers: list[OrderPassengerIn] = Field(min_length=1)
    contact_whatsapp: str = Field(min_length=8, max_length=20)
    flight_booking: FlightBookingCreateRequest | None = None


class OrderStatusUpdateRequest(BaseModel):
    """طلب تغيير حالة طلب من موظف/مدير، مع ملاحظة اختيارية."""

    new_status: OrderStatus
    notes: str | None = None


class OrderStatusLogOut(BaseModel):
    """تمثيل سطر واحد من سجل تغييرات حالة الطلب."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    old_status: OrderStatus | None
    new_status: OrderStatus
    changed_by: int
    notes: str | None
    created_at: datetime


class OrderOut(BaseModel):
    """تمثيل طلب كامل مع مسافريه وسجل حالاته."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    user_id: int
    service_id: int
    total_amount: Decimal
    currency_code: str
    status: OrderStatus
    created_at: datetime
    deliverable_signed_url: str | None = None
    contact_whatsapp: str | None
    passengers: list[OrderPassengerOut] = []
    status_logs: list[OrderStatusLogOut] = []
    refunds: list[RefundOut] = []
    flight_booking_detail: FlightBookingDetailOut | None = None
