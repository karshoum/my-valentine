# File: app/models/service.py

from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DECIMAL, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ServiceCategory


class Service(Base):
    """خدمة معروضة للعملاء (تذكرة طيران، فيزا، إقامة، أو تأمين)."""

    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(ServiceCategory, name="service_category"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    base_price_usd = Column(DECIMAL(10, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    discount_percentage = Column(DECIMAL(5, 2), nullable=True)
    discount_valid_until = Column(DateTime(timezone=True), nullable=True)

    visa_residency_detail = relationship(
        "VisaResidencyDetail", back_populates="service", uselist=False, cascade="all, delete-orphan"
    )
    b2b_rates = relationship("B2BServiceRate", back_populates="service", cascade="all, delete-orphan")
    requirements = relationship(
        "ServiceRequirement",
        back_populates="service",
        cascade="all, delete-orphan",
        order_by="ServiceRequirement.display_order",
    )

    @property
    def has_active_discount(self) -> bool:
        """يُعيد True إذا كان للخدمة عرض خصم سارٍ (نسبة محدَّدة ولم ينتهِ بعد)."""
        if not self.discount_percentage or not self.discount_valid_until:
            return False
        # SQLite (بيئة الاختبارات) يُعيد قيم DateTime بلا معلومات منطقة زمنية
        # (naive)، بعكس PostgreSQL في الإنتاج الذي يُعيدها aware؛ نطابق
        # الطرف الآخر لتفادي انهيار المقارنة بين naive و aware.
        now = datetime.now(timezone.utc)
        if self.discount_valid_until.tzinfo is None:
            now = now.replace(tzinfo=None)
        return self.discount_valid_until > now

    @property
    def effective_price_usd(self) -> Decimal:
        """يُعيد السعر الفعلي الحالي: السعر الأساسي بعد خصم العرض الساري إن وُجد."""
        if not self.has_active_discount:
            return self.base_price_usd
        multiplier = Decimal("1") - (self.discount_percentage / Decimal("100"))
        return (self.base_price_usd * multiplier).quantize(Decimal("0.01"))


class VisaResidencyDetail(Base):
    """تفاصيل إضافية خاصة بخدمات الفيزا/الإقامة فقط (متطلبات، مدة معالجة)."""

    __tablename__ = "visa_residency_details"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    country = Column(String(50), nullable=False)
    type = Column(String(50), nullable=False)
    requirements = Column(Text, nullable=True)
    processing_time = Column(String(50), nullable=True)
    is_dynamic_price = Column(Boolean, default=False, nullable=False)

    service = relationship("Service", back_populates="visa_residency_detail")


class B2BServiceRate(Base):
    """سعر خاص لخدمة معينة مخصَّص لوكيل B2B واحد، يتجاوز السعر الأساسي."""

    __tablename__ = "b2b_service_rates"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    custom_price_usd = Column(DECIMAL(10, 2), nullable=False)

    agent = relationship("AgentProfile", back_populates="custom_rates")
    service = relationship("Service", back_populates="b2b_rates")
