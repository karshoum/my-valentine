# File: app/models/service_requirement.py

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class ServiceRequirement(Base):
    """بند واحد ضمن قائمة المستندات/المتطلبات المطلوبة لخدمة معيّنة (يظهر للعميل عند الحجز)."""

    __tablename__ = "service_requirements"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_text = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)

    service = relationship("Service", back_populates="requirements")
