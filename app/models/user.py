# File: app/models/user.py

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.models.enums import UserRole


class User(Base):
    """
    حساب مستخدم واحد في النظام (admin/employee/agent/customer). حسابات
    الوكلاء ترتبط بسجل AgentProfile إضافي عبر agent_profile.
    """

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    phone = Column(String(20), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole, name="user_role"), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    agent_profile = relationship(
        "AgentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
