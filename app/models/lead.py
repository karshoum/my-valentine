# File: app/models/lead.py

from sqlalchemy import Column, DateTime, Enum, Integer, String, Text
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import LeadServiceType


class LeadRequest(Base):
    """طلب اهتمام عام (Lead) بخدمة مستقبلية (لوجستيك أو دعاية وإعلام)."""

    __tablename__ = "lead_requests"

    id = Column(Integer, primary_key=True, index=True)
    service_type = Column(Enum(LeadServiceType, name="lead_service_type"), nullable=False)
    customer_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
