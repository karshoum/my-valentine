# File: app/models/social_link.py

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class SocialLink(Base):
    """رابط تواصل اجتماعي واحد (واتساب/فيسبوك/إنستغرام/...) يديره المدير ويظهر لكل زوّار الصفحة العامة."""

    __tablename__ = "social_links"

    id = Column(Integer, primary_key=True, index=True)
    platform_name = Column(String(50), nullable=False)
    url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0, nullable=False, server_default="0")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
