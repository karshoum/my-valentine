# File: app/schemas/auth.py

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import UserRole


class RegisterRequest(BaseModel):
    """بيانات تسجيل عميل جديد (B2C) عبر POST /api/v1/auth/register."""

    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr | None = None
    phone: str = Field(min_length=6, max_length=20)
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    """بيانات تسجيل الدخول: مُعرّف (بريد أو هاتف) وكلمة مرور."""

    identifier: str = Field(description="البريد الإلكتروني أو رقم الهاتف")
    password: str


class TokenResponse(BaseModel):
    """استجابة تسجيل الدخول الناجح: توكن JWT مع بيانات أساسية للمستخدم."""

    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str
