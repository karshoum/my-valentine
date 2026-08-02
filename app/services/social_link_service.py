# File: app/services/social_link_service.py

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.social_link import SocialLink
from app.models.user import User
from app.schemas.social_link import SocialLinkCreateRequest, SocialLinkUpdateRequest
from app.services import audit_service


def create_social_link(db: Session, payload: SocialLinkCreateRequest, created_by: User) -> SocialLink:
    """
    يضيف رابط تواصل اجتماعي جديداً (admin فقط) ويسجّل الحركة في سجل التدقيق.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات الرابط الجديد (اسم المنصة، الرابط، ترتيب العرض، الحالة).
        created_by: المدير الذي ينفّذ عملية الإضافة.

    Returns:
        SocialLink: الرابط المُنشَأ حديثاً.
    """
    link = SocialLink(**payload.model_dump())
    db.add(link)
    audit_service.log_action(
        db, user_id=created_by.id, action="create_social_link", details={"platform_name": payload.platform_name}
    )
    db.commit()
    db.refresh(link)
    return link


def list_active_social_links(db: Session) -> list[SocialLink]:
    """يُعيد روابط التواصل المُفعَّلة فقط، مرتّبة حسب ترتيب العرض (عام، بلا تسجيل دخول)."""
    return (
        db.query(SocialLink)
        .filter(SocialLink.is_active.is_(True))
        .order_by(SocialLink.display_order.asc(), SocialLink.id.asc())
        .all()
    )


def list_all_social_links(db: Session) -> list[SocialLink]:
    """يُعيد كل روابط التواصل (مفعّلة وموقوفة)، مرتّبة حسب ترتيب العرض (موظف أو مدير فقط)."""
    return db.query(SocialLink).order_by(SocialLink.display_order.asc(), SocialLink.id.asc()).all()


def get_social_link_or_404(db: Session, link_id: int) -> SocialLink:
    """يجلب رابط تواصل بمعرّفه أو يرفع استثناءً 404 إذا لم يوجد."""
    link = db.query(SocialLink).filter(SocialLink.id == link_id).first()
    if not link:
        raise AppException("رابط التواصل غير موجود", status_code=404)
    return link


def update_social_link(db: Session, link_id: int, payload: SocialLinkUpdateRequest, updated_by: User) -> SocialLink:
    """
    يعدّل حقول رابط تواصل جزئياً (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        link_id: معرّف الرابط المطلوب تعديله.
        payload: الحقول المطلوب تعديلها.
        updated_by: المدير الذي ينفّذ التعديل.

    Returns:
        SocialLink: الرابط بعد التحديث.
    """
    link = get_social_link_or_404(db, link_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(link, field, value)

    audit_service.log_action(db, user_id=updated_by.id, action="update_social_link", details={"link_id": link_id})
    db.commit()
    db.refresh(link)
    return link


def delete_social_link(db: Session, link_id: int, deleted_by: User) -> None:
    """يحذف رابط تواصل نهائياً (admin فقط)."""
    link = get_social_link_or_404(db, link_id)
    audit_service.log_action(db, user_id=deleted_by.id, action="delete_social_link", details={"link_id": link_id})
    db.delete(link)
    db.commit()
