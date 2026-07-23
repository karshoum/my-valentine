# File: app/schemas/service_requirement.py

from pydantic import BaseModel, ConfigDict, Field


class ServiceRequirementOut(BaseModel):
    """تمثيل بند متطلب واحد في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    requirement_text: str
    display_order: int


class ServiceRequirementCreateRequest(BaseModel):
    """بيانات إضافة بند متطلب جديد لخدمة (موظف/مدير)."""

    requirement_text: str = Field(min_length=2, max_length=500)
    display_order: int = 0


class ServiceRequirementUpdateRequest(BaseModel):
    """حقول بند المتطلب القابلة للتعديل الجزئي (كلها اختيارية)."""

    requirement_text: str | None = Field(default=None, min_length=2, max_length=500)
    display_order: int | None = None
