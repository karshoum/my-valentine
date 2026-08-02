# File: app/routers/offices.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin, require_staff
from app.models.office import Office
from app.models.user import User
from app.schemas.office import OfficeCreateRequest, OfficeOut, OfficeUpdateRequest
from app.services import office_service

router = APIRouter(prefix="/api/v1/offices", tags=["مكاتبنا"])


@router.get("", response_model=list[OfficeOut])
def list_public_offices(db: Session = Depends(get_db)) -> list[Office]:
    """يُعيد المكاتب المُفعَّلة فقط (عام، بلا تسجيل دخول) لعرضها في الصفحة العامة."""
    return office_service.list_active_offices(db)


@router.get("/all", response_model=list[OfficeOut])
def list_all_offices(db: Session = Depends(get_db), _: User = Depends(require_staff)) -> list[Office]:
    """يُعيد كل المكاتب (مفعَّلة وموقوفة) لإدارتها من لوحة التحكم (موظف أو مدير فقط)."""
    return office_service.list_all_offices(db)


@router.post("", response_model=OfficeOut, status_code=status.HTTP_201_CREATED)
def create_office(
    payload: OfficeCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Office:
    """يضيف مكتباً/فرعاً جديداً (admin فقط)."""
    return office_service.create_office(db, payload, admin_user)


@router.patch("/{office_id}", response_model=OfficeOut)
def update_office(
    office_id: int,
    payload: OfficeUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Office:
    """يعدّل حقول مكتب موجود جزئياً (admin فقط)."""
    return office_service.update_office(db, office_id, payload, admin_user)


@router.delete("/{office_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None)
def delete_office(
    office_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> None:
    """يحذف مكتباً نهائياً (admin فقط)."""
    office_service.delete_office(db, office_id, admin_user)
