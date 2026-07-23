# File: app/schemas/user.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import UserRole


class StaffCreateRequest(BaseModel):
    """بيانات إنشاء حساب موظف أو مدير جديد (بصلاحية admin فقط)."""

    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr | None = None
    phone: str = Field(min_length=6, max_length=20)
    password: str = Field(min_length=8, max_length=128)
    role: UserRole = Field(description="admin أو employee فقط")


class UserStatusUpdateRequest(BaseModel):
    """طلب تفعيل/تعطيل حساب مستخدم."""

    is_active: bool


class PasswordChangeRequest(BaseModel):
    """طلب تغيير كلمة المرور للمستخدم الحالي (يتطلب كلمة المرور القديمة)."""

    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    """تمثيل مستخدم آمن للإرجاع في الاستجابات (بدون password_hash)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr | None
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime
