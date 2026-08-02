# File: app/models/office.py

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class Office(Base):
    """مكتب/فرع واحد للوكالة (دولة + عنوان تفصيلي) يديره المدير ويظهر لكل زوّار الصفحة العامة."""

    __tablename__ = "offices"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String(50), nullable=False)
    address_line = Column(String(255), nullable=False)
    display_order = Column(Integer, default=0, nullable=False, server_default="0")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
