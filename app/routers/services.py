# File: app/routers/services.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin, require_staff
from app.models.enums import ServiceCategory
from app.models.service import Service
from app.models.service_requirement import ServiceRequirement
from app.models.user import User
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceDiscountUpdateRequest,
    ServiceOut,
    ServiceUpdateRequest,
)
from app.schemas.service_requirement import (
    ServiceRequirementCreateRequest,
    ServiceRequirementOut,
    ServiceRequirementUpdateRequest,
)
from app.services import service_requirement_service, service_service

router = APIRouter(prefix="/api/v1/services", tags=["الخدمات (طيران/فيزا/إقامة/تأمين)"])


@router.get("", response_model=list[ServiceOut])
def list_services(category: ServiceCategory | None = None, db: Session = Depends(get_db)) -> list[Service]:
    """يُعيد قائمة الخدمات المفعَّلة، مع تصفية اختيارية حسب التصنيف (عام، بلا حاجة لتسجيل دخول)."""
    return service_service.list_services(db, category)


@router.get("/manage/all", response_model=list[ServiceOut])
def list_all_services_for_management(
    category: ServiceCategory | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(require_staff),
) -> list[Service]:
    """يُعيد كل الخدمات، مفعَّلة وغير مفعَّلة، لأغراض الإدارة (موظف أو مدير فقط)."""
    return service_service.list_services(db, category, only_active=False)


@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)) -> Service:
    """يُعيد تفاصيل خدمة واحدة بمعرّفها."""
    return service_service.get_service_or_404(db, service_id)


@router.post("", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(
    payload: ServiceCreateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> Service:
    """ينشئ خدمة جديدة (موظف أو مدير فقط)."""
    return service_service.create_service(db, payload, staff_user)


@router.patch("/{service_id}", response_model=ServiceOut)
def update_service(
    service_id: int,
    payload: ServiceUpdateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> Service:
    """يحدّث حقول خدمة جزئياً (موظف أو مدير فقط)."""
    return service_service.update_service(db, service_id, payload, staff_user)


@router.patch("/{service_id}/discount", response_model=ServiceOut)
def set_service_discount(
    service_id: int,
    payload: ServiceDiscountUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Service:
    """يحدّد أو يلغي عرض خصم محدود المدة على خدمة (admin فقط)."""
    return service_service.set_service_discount(db, service_id, payload, admin_user)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> None:
    """يحذف خدمة نهائياً (admin فقط)؛ يُرفض الحذف إذا كانت مرتبطة بطلبات سابقة."""
    service_service.delete_service(db, service_id, admin_user)


@router.post(
    "/{service_id}/requirements", response_model=ServiceRequirementOut, status_code=status.HTTP_201_CREATED
)
def add_service_requirement(
    service_id: int,
    payload: ServiceRequirementCreateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> ServiceRequirement:
    """يضيف بند متطلب (مستند مطلوب) جديد لخدمة (موظف أو مدير فقط)."""
    return service_requirement_service.add_requirement(db, service_id, payload, staff_user)


@router.patch("/requirements/{requirement_id}", response_model=ServiceRequirementOut)
def update_service_requirement(
    requirement_id: int,
    payload: ServiceRequirementUpdateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> ServiceRequirement:
    """يحدّث نص بند متطلب أو ترتيب عرضه (موظف أو مدير فقط)."""
    return service_requirement_service.update_requirement(db, requirement_id, payload, staff_user)


@router.delete("/requirements/{requirement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> None:
    """يحذف بند متطلب نهائياً (موظف أو مدير فقط)."""
    service_requirement_service.delete_requirement(db, requirement_id, staff_user)
