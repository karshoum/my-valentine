# File: app/models/payment_settings.py

from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.core.database import Base


class PaymentSettings(Base):
    """
    إعداد وسائل الدفع الوحيد (صف واحد فقط): رقم واسم حساب بنكك الذي
    يحوّل عليه العملاء عند اختيار الدفع عبر بنكك، ورقم واتساب يُحوَّل
    إليه العميل مباشرة عند اختيار الدفع بالفيزا لتأكيد العملية، مع
    مفتاحي تفعيل/تعطيل مستقلَّين لكل وسيلة (تظهر/تختفي للزوار تبعاً لهما).
    """

    __tablename__ = "payment_settings"

    id = Column(Integer, primary_key=True, index=True)
    bankak_account_number = Column(String(50), nullable=True)
    bankak_account_name = Column(String(150), nullable=True)
    bankak_is_enabled = Column(Boolean, default=True, nullable=False)
    visa_whatsapp_number = Column(String(20), nullable=True)
    visa_is_enabled = Column(Boolean, default=True, nullable=False)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=lambda: datetime.now(timezone.utc))
