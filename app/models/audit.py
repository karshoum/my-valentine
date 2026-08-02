# File: app/models/audit.py

from sqlalchemy import JSON, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.core.database import Base

# JSONB في PostgreSQL (الإنتاج)، ويتحول تلقائياً إلى JSON عادي على أي
# قاعدة بيانات أخرى (مثل SQLite في بيئة الاختبارات).
JSONVariant = JSON().with_variant(JSONB, "postgresql")


class AuditLog(Base):
    """
    سجل تدقيق لكل حركة مالية أو إدارية حساسة (تغيير سعر صرف، موافقة على
    مسترد، تعديل صلاحية مستخدم، ...). يُكتَب إليه من audit_service فقط.
    """

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(JSONVariant, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
