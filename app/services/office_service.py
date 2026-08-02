# File: app/services/office_service.py

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.office import Office
from app.models.user import User
from app.schemas.office import OfficeCreateRequest, OfficeUpdateRequest
from app.services import audit_service


def create_office(db: Session, payload: OfficeCreateRequest, created_by: User) -> Office:
    """
    يضيف مكتباً/فرعاً جديداً (admin فقط) ويسجّل الحركة في سجل التدقيق.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات المكتب الجديد (الدولة، العنوان، ترتيب العرض، الحالة).
        created_by: المدير الذي ينفّذ عملية الإضافة.

    Returns:
        Office: المكتب المُنشَأ حديثاً.
    """
    office = Office(**payload.model_dump())
    db.add(office)
    audit_service.log_action(db, user_id=created_by.id, action="create_office", details={"country": payload.country})
    db.commit()
    db.refresh(office)
    return office


def list_active_offices(db: Session) -> list[Office]:
    """يُعيد المكاتب المُفعَّلة فقط، مرتّبة حسب ترتيب العرض (عام، بلا تسجيل دخول)."""
    return (
        db.query(Office)
        .filter(Office.is_active.is_(True))
        .order_by(Office.display_order.asc(), Office.id.asc())
        .all()
    )


def list_all_offices(db: Session) -> list[Office]:
    """يُعيد كل المكاتب (مفعَّلة وموقوفة)، مرتّبة حسب ترتيب العرض (موظف أو مدير فقط)."""
    return db.query(Office).order_by(Office.display_order.asc(), Office.id.asc()).all()


def get_office_or_404(db: Session, office_id: int) -> Office:
    """يجلب مكتباً بمعرّفه أو يرفع استثناءً 404 إذا لم يوجد."""
    office = db.query(Office).filter(Office.id == office_id).first()
    if not office:
        raise AppException("المكتب غير موجود", status_code=404)
    return office


def update_office(db: Session, office_id: int, payload: OfficeUpdateRequest, updated_by: User) -> Office:
    """
    يعدّل حقول مكتب جزئياً (admin فقط).

    Args:
        db: جلسة قاعدة البيانات.
        office_id: معرّف المكتب المطلوب تعديله.
        payload: الحقول المطلوب تعديلها.
        updated_by: المدير الذي ينفّذ التعديل.

    Returns:
        Office: المكتب بعد التحديث.
    """
    office = get_office_or_404(db, office_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(office, field, value)

    audit_service.log_action(db, user_id=updated_by.id, action="update_office", details={"office_id": office_id})
    db.commit()
    db.refresh(office)
    return office


def delete_office(db: Session, office_id: int, deleted_by: User) -> None:
    """يحذف مكتباً نهائياً (admin فقط)."""
    office = get_office_or_404(db, office_id)
    audit_service.log_action(db, user_id=deleted_by.id, action="delete_office", details={"office_id": office_id})
    db.delete(office)
    db.commit()
