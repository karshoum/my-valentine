# File: app/models/agent.py

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import PaymentMode


class AgentProfile(Base):
    """
    ملف تعريف وكيل B2B (فرانشايز) مرتبط بحساب مستخدم واحد؛ يحمل وضع
    الدفع، رصيد المحفظة، الحد الائتماني، ونسبة الخصم الافتراضية.
    """

    __tablename__ = "agent_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    agency_name = Column(String(100), nullable=False)
    payment_mode = Column(Enum(PaymentMode, name="payment_mode"), nullable=False)
    wallet_balance = Column(DECIMAL(12, 2), default=0, nullable=False)
    credit_limit = Column(DECIMAL(12, 2), default=0, nullable=False)
    discount_rate = Column(DECIMAL(5, 2), default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="agent_profile")
    custom_rates = relationship("B2BServiceRate", back_populates="agent", cascade="all, delete-orphan")
    wallet_logs = relationship("AgentWalletLog", back_populates="agent", cascade="all, delete-orphan")
