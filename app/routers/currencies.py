from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.schemas.currency import CurrencyCreateRequest, CurrencyManualUpdateRequest, CurrencyOut
from app.models.user import User
from app.services import currency_service

router = APIRouter(prefix="/api/v1/currencies", tags=["العملات وسعر الصرف"])


@router.get("", response_model=list[CurrencyOut])
def list_currencies(db: Session = Depends(get_db)):
    return currency_service.list_currencies(db)


@router.post("", response_model=CurrencyOut, status_code=status.HTTP_201_CREATED)
def create_currency(
    payload: CurrencyCreateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    return currency_service.create_currency(db, payload, admin_user)


@router.patch("/{code}/rate", response_model=CurrencyOut)
def update_currency_rate(
    code: str,
    payload: CurrencyManualUpdateRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
):
    """
    التحديث اليدوي الحصري لسعر الصرف (مثال: الجنيه السوداني SDG مقابل
    الدولار). متاح فقط للمدير (admin)، ولا يوجد أي مسار آخر في النظام
    لتحديث هذا السعر آلياً.
    """
    return currency_service.update_currency_rate(db, code, payload.rate_to_usd, admin_user)
