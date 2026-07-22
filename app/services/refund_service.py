from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import OrderStatus, RefundStatus, UserRole
from app.models.refund import Refund
from app.models.user import User
from app.schemas.refund import RefundCreateRequest
from app.services import agent_service, audit_service, order_service, wallet_service


def create_refund_request(db: Session, order_id: int, current_user: User, payload: RefundCreateRequest) -> Refund:
    order = order_service.get_order_with_access_check(db, order_id, current_user)

    if order.status not in (OrderStatus.processing, OrderStatus.in_system, OrderStatus.completed):
        raise AppException("لا يمكن طلب استرداد لهذا الطلب في حالته الحالية", status_code=400)

    refund = Refund(
        order_id=order.id,
        refund_amount=payload.refund_amount,
        currency_code=payload.currency_code or order.currency_code,
        reason=payload.reason,
        status=RefundStatus.pending,
    )
    db.add(refund)
    db.commit()
    db.refresh(refund)
    return refund


def get_refund_or_404(db: Session, refund_id: int) -> Refund:
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    if not refund:
        raise AppException("طلب الاسترداد غير موجود", status_code=404)
    return refund


def approve_refund(db: Session, refund_id: int, admin_user: User) -> Refund:
    refund = get_refund_or_404(db, refund_id)
    if refund.status != RefundStatus.pending:
        raise AppException("تمت مراجعة طلب الاسترداد هذا مسبقاً", status_code=400)

    refund.status = RefundStatus.approved
    audit_service.log_action(
        db, user_id=admin_user.id, action="approve_refund", details={"refund_id": refund.id}
    )
    db.commit()
    db.refresh(refund)
    return refund


def decline_refund(db: Session, refund_id: int, admin_user: User, notes: str | None) -> Refund:
    refund = get_refund_or_404(db, refund_id)
    if refund.status != RefundStatus.pending:
        raise AppException("تمت مراجعة طلب الاسترداد هذا مسبقاً", status_code=400)

    refund.status = RefundStatus.declined
    refund.processed_by = admin_user.id
    refund.processed_at = datetime.now(timezone.utc)
    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="decline_refund",
        details={"refund_id": refund.id, "notes": notes},
    )
    db.commit()
    db.refresh(refund)
    return refund


def process_refund(db: Session, refund_id: int, admin_user: User) -> Refund:
    """
    تنفيذ الاسترداد فعلياً: يغيّر حالة الطلب إلى refunded، وإن كان صاحب
    الطلب وكيلاً (B2B) يُعاد المبلغ إلى محفظته مع تسجيل الحركة في
    agent_wallet_logs.
    """
    refund = get_refund_or_404(db, refund_id)
    if refund.status != RefundStatus.approved:
        raise AppException("يجب اعتماد طلب الاسترداد أولاً قبل تنفيذه", status_code=400)

    order = order_service.get_order_or_404(db, refund.order_id)
    order.status = OrderStatus.refunded

    if order.user_id:
        from app.models.user import User as UserModel

        order_owner = db.query(UserModel).filter(UserModel.id == order.user_id).first()
        if order_owner and order_owner.role == UserRole.agent:
            agent = agent_service.get_agent_by_user_or_404(db, order_owner.id)
            wallet_service.refund_to_wallet(db, agent, refund.refund_amount, order)

    refund.status = RefundStatus.processed
    refund.processed_by = admin_user.id
    refund.processed_at = datetime.now(timezone.utc)

    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="process_refund",
        details={"refund_id": refund.id, "order_id": order.id, "amount": str(refund.refund_amount)},
    )
    db.commit()
    db.refresh(refund)
    return refund
