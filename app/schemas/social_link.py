# File: app/schemas/social_link.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class SocialLinkCreateRequest(BaseModel):
    """بيانات إضافة رابط تواصل اجتماعي جديد (admin فقط)."""

    platform_name: str = Field(min_length=2, max_length=50, description="مثال: واتساب، فيسبوك، إنستغرام")
    url: str = Field(min_length=8, max_length=500)
    display_order: int = 0
    is_active: bool = True

    @field_validator("url")
    @classmethod
    def validate_url_scheme(cls, value: str) -> str:
        """يتأكد أن الرابط يبدأ بمخطط http/https صالح قبل حفظه."""
        if not value.startswith(("http://", "https://")):
            raise ValueError("الرابط يجب أن يبدأ بـ http:// أو https://")
        return value


class SocialLinkUpdateRequest(BaseModel):
    """تعديل جزئي لرابط تواصل اجتماعي موجود (admin فقط). الحقول غير المُرسَلة تبقى دون تغيير."""

    platform_name: str | None = Field(default=None, min_length=2, max_length=50)
    url: str | None = Field(default=None, min_length=8, max_length=500)
    display_order: int | None = None
    is_active: bool | None = None

    @field_validator("url")
    @classmethod
    def validate_url_scheme(cls, value: str | None) -> str | None:
        """يتأكد أن الرابط يبدأ بمخطط http/https صالح إن أُرسِل فعلاً."""
        if value is not None and not value.startswith(("http://", "https://")):
            raise ValueError("الرابط يجب أن يبدأ بـ http:// أو https://")
        return value


class SocialLinkOut(BaseModel):
    """تمثيل رابط تواصل اجتماعي للإرجاع في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    platform_name: str
    url: str
    display_order: int
    is_active: bool
    created_at: datetime
