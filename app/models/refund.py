# File: app/models/refund.py

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import RefundStatus


class Refund(Base):
    """
    طلب استرداد مبلغ لطلب مكتمل/قيد المعالجة، يمرّ عبر موافقة صريحة من
    admin قبل التنفيذ الفعلي (انظر refund_service).
    """

    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    refund_amount = Column(DECIMAL(12, 2), nullable=False)
    currency_code = Column(String(5), ForeignKey("currencies.code"), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(Enum(RefundStatus, name="refund_status"), default=RefundStatus.pending, nullable=False)
    processed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    processed_at = Column(DateTime(timezone=True), nullable=True)

    order = relationship("Order", back_populates="refunds")
