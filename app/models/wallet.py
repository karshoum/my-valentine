# File: app/models/wallet.py

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import WalletTransactionType


class AgentWalletLog(Base):
    """سجل حركة واحدة (إيداع/خصم/استرداد) على محفظة وكيل B2B."""

    __tablename__ = "agent_wallet_logs"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agent_profiles.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(Enum(WalletTransactionType, name="wallet_transaction_type"), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent = relationship("AgentProfile", back_populates="wallet_logs")
