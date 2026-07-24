# File: app/models/ship_booking_fee.py

from datetime import datetime, timezone

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer

from app.core.database import Base
from app.models.enums import FlightBookingFeeType


class ShipBookingFeeSetting(Base):
    """
    إعداد وحيد (صف واحد فقط) لرسم حجز تذاكر البواخر الحالي، يعدّله
    المدير في أي وقت (فلات بالدولار أو نسبة مئوية من سعر الحجز). يُطبَّق
    تلقائياً فوق سعر خط الباخرة الحقيقي (الذي يبقى كما هو دائماً) عند
    حساب أي حجز جديد، ويُعاد استخدام نوع الرسم نفسه المستخدَم لحجوزات
    الطيران (flat/percentage) تفادياً لتكرار نفس التعداد.
    """

    __tablename__ = "ship_booking_fee_settings"

    id = Column(Integer, primary_key=True, index=True)
    fee_type = Column(Enum(FlightBookingFeeType, name="ship_booking_fee_type"), nullable=False)
    fee_value = Column(DECIMAL(10, 2), nullable=False, default=0)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
