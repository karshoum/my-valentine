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


class GoogleLoginRequest(BaseModel):
    """توكن الهوية (ID Token) الصادر من Google Identity Services في المتصفح."""

    id_token: str = Field(min_length=10)


class TokenResponse(BaseModel):
    """استجابة تسجيل الدخول الناجح: توكن JWT مع بيانات أساسية للمستخدم."""

    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str


class ForgotPasswordRequest(BaseModel):
    """طلب استعادة كلمة مرور: مُعرّف (بريد أو هاتف) لحساب موجود."""

    identifier: str = Field(description="البريد الإلكتروني أو رقم الهاتف")


class ResetPasswordRequest(BaseModel):
    """ضبط كلمة مرور جديدة عبر رابط استعادة موقّع وصالح."""

    uid: int
    expires: int
    signature: str
    new_password: str = Field(min_length=8, max_length=128)
