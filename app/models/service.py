from sqlalchemy import DECIMAL, Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import ServiceCategory


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(Enum(ServiceCategory, name="service_category"), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    base_price_usd = Column(DECIMAL(10, 2), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    visa_residency_detail = relationship(
        "VisaResidencyDetail", back_populates="service", uselist=False, cascade="all, delete-orphan"
    )
    b2b_rates = relationship("B2BServiceRate", back_populates="service", cascade="all, delete-orphan")


class VisaResidencyDetail(Base):
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
    __tablename__ = "b2b_service_rates"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    custom_price_usd = Column(DECIMAL(10, 2), nullable=False)

    agent = relationship("AgentProfile", back_populates="custom_rates")
    service = relationship("Service", back_populates="b2b_rates")
