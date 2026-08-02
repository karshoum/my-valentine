# File: app/routers/reviews.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreateRequest, ReviewOut
from app.services import review_service

router = APIRouter(prefix="/api/v1/reviews", tags=["آراء العملاء"])


@router.get("", response_model=list[ReviewOut])
def list_reviews(db: Session = Depends(get_db)) -> list[Review]:
    """يُعيد كل آراء العملاء (عام، بلا تسجيل دخول) لعرضها في الصفحة العامة."""
    return review_service.list_reviews(db)


@router.post("", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Review:
    """يضيف رأياً/تقييماً جديداً باسم المستخدم الحالي المسجَّل دخوله."""
    return review_service.create_review(db, payload, current_user)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> None:
    """يحذف رأياً نهائياً (admin فقط)."""
    review_service.delete_review(db, review_id, admin_user)
