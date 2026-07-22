from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_staff
from app.models.enums import ServiceCategory
from app.models.user import User
from app.schemas.service import ServiceCreateRequest, ServiceOut, ServiceUpdateRequest
from app.services import service_service

router = APIRouter(prefix="/api/v1/services", tags=["الخدمات (طيران/فيزا/إقامة/تأمين)"])


@router.get("", response_model=list[ServiceOut])
def list_services(category: ServiceCategory | None = None, db: Session = Depends(get_db)):
    return service_service.list_services(db, category)


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    return service_service.get_service_or_404(db, service_id)


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
):
    return service_service.create_service(db, payload, staff_user)


@router.patch("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    payload: ServiceUpdateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
):
    return service_service.update_service(db, service_id, payload, staff_user)
