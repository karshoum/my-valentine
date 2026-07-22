from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import ServiceCategory
from app.models.service import Service, VisaResidencyDetail
from app.models.user import User
from app.schemas.service import ServiceCreateRequest, ServiceUpdateRequest
from app.services import audit_service


def list_services(db: Session, category: ServiceCategory | None = None, only_active: bool = True) -> list[Service]:
    query = db.query(Service)
    if only_active:
        query = query.filter(Service.is_active.is_(True))
    if category:
        query = query.filter(Service.category == category)
    return query.order_by(Service.created_at.desc()).all()


def get_service_or_404(db: Session, service_id: int) -> Service:
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise AppException("الخدمة غير موجودة", status_code=404)
    return service


def create_service(db: Session, payload: ServiceCreateRequest, created_by: User) -> Service:
    service = Service(
        category=payload.category,
        title=payload.title,
        description=payload.description,
        base_price_usd=payload.base_price_usd,
    )
    db.add(service)
    db.flush()

    if payload.visa_residency_detail:
        if payload.category not in (ServiceCategory.visa, ServiceCategory.residency):
            raise AppException("تفاصيل الفيزا/الإقامة تُضاف فقط لخدمات من نوع فيزا أو إقامة", status_code=400)
        detail = VisaResidencyDetail(service_id=service.id, **payload.visa_residency_detail.model_dump())
        db.add(detail)

    audit_service.log_action(
        db, user_id=created_by.id, action="create_service", details={"title": payload.title}
    )
    db.commit()
    db.refresh(service)
    return service


def update_service(db: Session, service_id: int, payload: ServiceUpdateRequest, changed_by: User) -> Service:
    service = get_service_or_404(db, service_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(service, field, value)

    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_service",
        details={"service_id": service.id, **{k: str(v) for k, v in updates.items()}},
    )
    db.commit()
    db.refresh(service)
    return service
