# File: app/schemas/office.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OfficeCreateRequest(BaseModel):
    """بيانات إضافة مكتب/فرع جديد (admin فقط)."""

    country: str = Field(min_length=2, max_length=50)
    address_line: str = Field(min_length=2, max_length=255)
    display_order: int = 0
    is_active: bool = True


class OfficeUpdateRequest(BaseModel):
    """تعديل جزئي لمكتب/فرع موجود (admin فقط). الحقول غير المُرسَلة تبقى دون تغيير."""

    country: str | None = Field(default=None, min_length=2, max_length=50)
    address_line: str | None = Field(default=None, min_length=2, max_length=255)
    display_order: int | None = None
    is_active: bool | None = None


class OfficeOut(BaseModel):
    """تمثيل مكتب/فرع للإرجاع في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    country: str
    address_line: str
    display_order: int
    is_active: bool
    created_at: datetime
