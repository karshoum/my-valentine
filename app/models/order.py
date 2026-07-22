from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import OrderStatus


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    total_amount = Column(DECIMAL(12, 2), nullable=False)
    currency_code = Column(String(5), ForeignKey("currencies.code"), nullable=False)
    status = Column(Enum(OrderStatus, name="order_status"), default=OrderStatus.pending, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    passengers = relationship("OrderPassenger", back_populates="order", cascade="all, delete-orphan")
    status_logs = relationship(
        "OrderStatusLog",
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderStatusLog.created_at",
    )
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")
    refunds = relationship("Refund", back_populates="order", cascade="all, delete-orphan")


class OrderPassenger(Base):
    __tablename__ = "order_passengers"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    full_name = Column(String(100), nullable=False)
    passport_number = Column(String(30), nullable=True)
    passport_file_url = Column(String(255), nullable=True)

    order = relationship("Order", back_populates="passengers")


class OrderStatusLog(Base):
    __tablename__ = "order_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    old_status = Column(Enum(OrderStatus, name="order_status"), nullable=True)
    new_status = Column(Enum(OrderStatus, name="order_status"), nullable=False)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="status_logs")
