from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_staff
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.order import OrderCreateRequest, OrderOut, OrderStatusUpdateRequest
from app.services import order_service

router = APIRouter(prefix="/api/v1/orders", tags=["الطلبات وتتبع الحالة"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return order_service.create_order(db, current_user, payload)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return order_service.list_orders_for_user(db, current_user)


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return order_service.get_order_with_access_check(db, order_id, current_user)


@router.patch("/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
):
    return order_service.update_order_status(db, order_id, payload.new_status, staff_user, payload.notes)
