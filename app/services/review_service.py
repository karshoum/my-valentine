# File: app/services/review_service.py

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import AppException
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreateRequest
from app.services import audit_service


def create_review(db: Session, payload: ReviewCreateRequest, author: User) -> Review:
    """
    ينشئ رأياً/تقييماً جديداً لصاحبه المسجَّل دخوله، يظهر مباشرة في
    الصفحة العامة دون حاجة لموافقة إدارية مسبقة.

    Args:
        db: جلسة قاعدة البيانات.
        payload: التقييم (1-5) ونص التعليق.
        author: المستخدم الحالي صاحب الرأي.

    Returns:
        Review: الرأي المُنشَأ حديثاً.
    """
    review = Review(user_id=author.id, rating=payload.rating, comment=payload.comment)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


def list_reviews(db: Session) -> list[Review]:
    """يُعيد كل الآراء مرتّبة تنازلياً حسب تاريخ الإضافة (عام، بلا تسجيل دخول)."""
    return db.query(Review).options(joinedload(Review.user)).order_by(Review.created_at.desc()).all()


def delete_review(db: Session, review_id: int, deleted_by: User) -> None:
    """
    يحذف رأياً نهائياً (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        review_id: معرّف الرأي المطلوب حذفه.
        deleted_by: المدير الذي ينفّذ الحذف.

    Raises:
        AppException: 404 إذا لم يوجد رأي بهذا المعرّف.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise AppException("الرأي غير موجود", status_code=404)

    audit_service.log_action(db, user_id=deleted_by.id, action="delete_review", details={"review_id": review_id})
    db.delete(review)
    db.commit()
