# File: app/models/ship_route.py

from sqlalchemy import DECIMAL, Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class ShipRoute(Base):
    """خط باخرة مُعدّ من قِبل المدير: مدينة انطلاق/وصول وأسعار حسب فئة العمر."""

    __tablename__ = "ship_routes"

    id = Column(Integer, primary_key=True, index=True)
    origin_city = Column(String(100), nullable=False)
    destination_city = Column(String(100), nullable=False)
    adult_price_usd = Column(DECIMAL(10, 2), nullable=False, default=0)
    child_price_usd = Column(DECIMAL(10, 2), nullable=False, default=0)
    infant_price_usd = Column(DECIMAL(10, 2), nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
