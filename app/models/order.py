# File: app/models/order.py

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.core.storage import generate_signed_url
from app.models.enums import OrderStatus


class Order(Base):
    """
    طلب واحد (تذكرة/فيزا/إقامة/تأمين) لعميل أو وكيل. حالته تنتقل حصراً
    عبر order_service.update_order_status وفق مصفوفة انتقالات مقيَّدة.
    """

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    currency_code = Column(String(5), ForeignKey("currencies.code"), nullable=False)
    status = Column(Enum(OrderStatus, name="order_status"), default=OrderStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deliverable_file_url = Column(String(255), nullable=True)
    contact_whatsapp = Column(String(20), nullable=True)

    passengers = relationship("OrderPassenger", back_populates="order", cascade="all, delete-orphan")
    status_logs = relationship(
        "OrderStatusLog",
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderStatusLog.created_at",
    )
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="order", cascade="all, delete-orphan")
    customer = relationship("User", foreign_keys=[user_id])
    flight_booking_detail = relationship(
        "FlightBookingDetail", back_populates="order", uselist=False, cascade="all, delete-orphan"
    )

    @property
    def deliverable_signed_url(self) -> str | None:
        """يُعيد رابطاً موقّعاً ومحدود الصلاحية للمستند النهائي (تذكرة/فيزا) إن وُجد."""
        if not self.deliverable_file_url:
            return None
        return generate_signed_url(self.deliverable_file_url)


class OrderPassenger(Base):
    """بيانات مسافر واحد ضمن طلب (قد يحتوي الطلب عدة مسافرين)."""

    __tablename__ = "order_passengers"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(100), nullable=False)
    passport_number = Column(String(30), nullable=True)
    passport_file_url = Column(String(255), nullable=True)

    order = relationship("Order", back_populates="passengers")


class OrderStatusLog(Base):
    """سجل تدقيق لكل تغيير حالة طلب، مع تحديد الموظف الذي نفّذ التغيير."""

    __tablename__ = "order_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(Enum(OrderStatus, name="order_status"), nullable=True)
    new_status = Column(Enum(OrderStatus, name="order_status"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="status_logs")
