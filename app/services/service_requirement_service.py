# File: app/services/service_requirement_service.py

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.service_requirement import ServiceRequirement
from app.models.user import User
from app.schemas.service_requirement import ServiceRequirementCreateRequest, ServiceRequirementUpdateRequest
from app.services import audit_service, service_service


def add_requirement(
    db: Session, service_id: int, payload: ServiceRequirementCreateRequest, added_by: User
) -> ServiceRequirement:
    """
    يضيف بند متطلب جديد (مستند مطلوب) لخدمة قائمة.

    Args:
        db: جلسة قاعدة البيانات.
        service_id: معرّف الخدمة المستهدَفة.
        payload: نص البند وترتيب عرضه.
        added_by: الموظف/المدير الذي ينفّذ الإضافة.

    Returns:
        ServiceRequirement: البند المُنشَأ حديثاً.

    Raises:
        AppException: 404 إذا لم توجد الخدمة.
    """
    service_service.get_service_or_404(db, service_id)
    requirement = ServiceRequirement(service_id=service_id, **payload.model_dump())
    db.add(requirement)

    audit_service.log_action(
        db, user_id=added_by.id, action="add_service_requirement", details={"service_id": service_id}
    )
    db.commit()
    db.refresh(requirement)
    return requirement


def get_requirement_or_404(db: Session, requirement_id: int) -> ServiceRequirement:
    """يجلب بند متطلب بمعرّفه أو يرفع استثناء 404 إذا لم يوجد."""
    requirement = db.query(ServiceRequirement).filter(ServiceRequirement.id == requirement_id).first()
    if not requirement:
        raise AppException("بند المتطلب غير موجود", status_code=404)
    return requirement


def update_requirement(
    db: Session, requirement_id: int, payload: ServiceRequirementUpdateRequest, changed_by: User
) -> ServiceRequirement:
    """يحدّث نص بند المتطلب و/أو ترتيب عرضه جزئياً."""
    requirement = get_requirement_or_404(db, requirement_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(requirement, field, value)

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_service_requirement",
        details={"requirement_id": requirement.id, **{k: str(v) for k, v in updates.items()}},
    )
    db.commit()
    db.refresh(requirement)
    return requirement


def delete_requirement(db: Session, requirement_id: int, deleted_by: User) -> None:
    """يحذف بند متطلب نهائياً من قائمة خدمة."""
    requirement = get_requirement_or_404(db, requirement_id)

    audit_service.log_action(
        db,
        user_id=deleted_by.id,
        action="delete_service_requirement",
        details={"requirement_id": requirement.id, "service_id": requirement.service_id},
    )
    db.delete(requirement)
    db.commit()
