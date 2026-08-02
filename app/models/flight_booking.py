# File: app/models/flight_booking.py

from datetime import datetime, timezone

from sqlalchemy import DECIMAL, Column, Date, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import FlightBookingFeeType


class FlightBookingFeeSetting(Base):
    """
    إعداد وحيد (صف واحد فقط) لرسوم حجز الطيران الحالية، يعدّله المدير في
    أي وقت (فلات بالدولار أو نسبة مئوية). يُطبَّق تلقائياً على أي بحث/حجز
    رحلة جديد لحظة تنفيذه.
    """

    __tablename__ = "flight_booking_fee_settings"

    id = Column(Integer, primary_key=True, index=True)
    fee_type = Column(Enum(FlightBookingFeeType, name="flight_booking_fee_type"), nullable=False)
    fee_value = Column(DECIMAL(10, 2), nullable=False, default=0)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class FlightBookingDetail(Base):
    """تفاصيل رحلة الطيران/الباخرة المختارة لطلب واحد (مسار، تواريخ، السعر الحقيقي، والرسوم المضافة)."""

    __tablename__ = "flight_booking_details"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, unique=True)
    origin = Column(String(10), nullable=False)
    destination = Column(String(10), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    airline_name = Column(String(100), nullable=False)
    base_fare_usd = Column(DECIMAL(10, 2), nullable=False)
    fee_amount_usd = Column(DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="flight_booking_detail", uselist=False)
