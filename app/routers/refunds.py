# File: app/routers/refunds.py

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_admin
from app.core.security import get_current_user
from app.models.refund import Refund
from app.models.user import User
from app.schemas.refund import RefundCreateRequest, RefundDecisionRequest, RefundOut
from app.services import refund_service

router = APIRouter(prefix="/api/v1/refunds", tags=["المستردات"])


@router.post("/orders/{order_id}", response_model=RefundOut, status_code=status.HTTP_201_CREATED)
def create_refund_request(
    order_id: int,
    payload: RefundCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Refund:
    """ينشئ طلب استرداد جديداً لطلب قائم (بحالة pending)."""
    return refund_service.create_refund_request(db, order_id, current_user, payload)


@router.patch("/{refund_id}/approve", response_model=RefundOut)
def approve_refund(
    refund_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Refund:
    """يعتمد طلب استرداد معلَّقاً (admin فقط)."""
    return refund_service.approve_refund(db, refund_id, admin_user)


@router.patch("/{refund_id}/decline", response_model=RefundOut)
def decline_refund(
    refund_id: int,
    payload: RefundDecisionRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Refund:
    """يرفض طلب استرداد معلَّقاً (admin فقط)."""
    return refund_service.decline_refund(db, refund_id, admin_user, payload.notes)


@router.post("/{refund_id}/process", response_model=RefundOut)
def process_refund(
    refund_id: int,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_admin),
) -> Refund:
    """ينفّذ استرداداً معتمَداً فعلياً، بما يشمل إعادة المبلغ لمحفظة الوكيل إن انطبق (admin فقط)."""
    return refund_service.process_refund(db, refund_id, admin_user)
