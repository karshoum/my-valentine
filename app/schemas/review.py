# File: app/schemas/review.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreateRequest(BaseModel):
    """بيانات إضافة رأي/تقييم جديد (أي مستخدم مسجَّل دخوله)."""

    rating: int = Field(ge=1, le=5, description="تقييم من 1 إلى 5")
    comment: str = Field(min_length=2, max_length=1000)


class ReviewOut(BaseModel):
    """تمثيل رأي عميل للعرض العام: اسم صاحب الرأي، التقييم، والتعليق."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_name: str
    rating: int
    comment: str
    created_at: datetime
