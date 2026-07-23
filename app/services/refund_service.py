# File: app/services/refund_service.py

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import OrderStatus, RefundStatus, UserRole
from app.models.order import OrderStatusLog
from app.models.refund import Refund
from app.models.user import User
from app.schemas.refund import RefundCreateRequest
from app.services import agent_service, audit_service, order_service, wallet_service


def create_refund_request(db: Session, order_id: int, current_user: User, payload: RefundCreateRequest) -> Refund:
    """
    ينشئ طلب استرداد جديداً بحالة pending لطلب قائم في مرحلة قابلة
    للاسترداد.

    Args:
        db: جلسة قاعدة البيانات.
        order_id: معرّف الطلب المُراد استرداده.
        current_user: صاحب الطلب أو موظف/مدير.
        payload: المبلغ المطلوب استرداده وسببه.

    Returns:
        Refund: طلب الاسترداد المُنشَأ بحالة pending.

    Raises:
        AppException: 400 إذا كانت حالة الطلب لا تسمح بطلب استرداد، أو
        إذا تجاوز المبلغ المطلوب قيمة الطلب الأصلية، أو 409 إذا كان
        هناك طلب استرداد آخر قيد المراجعة بالفعل لنفس الطلب.
    """
    order = order_service.get_order_with_access_check(db, order_id, current_user)

    if order.status not in (OrderStatus.processing, OrderStatus.in_system, OrderStatus.completed):
        raise AppException("لا يمكن طلب استرداد لهذا الطلب في حالته الحالية", status_code=400)

    if payload.refund_amount > order.total_amount:
        raise AppException("مبلغ الاسترداد المطلوب أكبر من قيمة الطلب", status_code=400)

    existing_open_refund = (
        db.query(Refund)
        .filter(Refund.order_id == order.id, Refund.status.in_((RefundStatus.pending, RefundStatus.approved)))
        .first()
    )
    if existing_open_refund:
        raise AppException("يوجد طلب استرداد آخر قيد المراجعة لهذا الطلب بالفعل", status_code=409)

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
    """يجلب طلب استرداد بمعرّفه أو يرفع استثناء 404 إذا لم يوجد."""
    refund = db.query(Refund).filter(Refund.id == refund_id).first()
    if not refund:
        raise AppException("طلب الاسترداد غير موجود", status_code=404)
    return refund


def list_refunds(db: Session, status_filter: RefundStatus | None = None) -> list[Refund]:
    """
    يُعيد كل طلبات الاسترداد لأغراض مراجعة الموظف/المدير، مع تصفية
    اختيارية حسب الحالة (لعرض المعلَّقة فقط عادة، وهي طابور عمل المراجعة).

    Args:
        db: جلسة قاعدة البيانات.
        status_filter: حالة اختيارية للتصفية بها (مثال: RefundStatus.pending).

    Returns:
        list[Refund]: طلبات الاسترداد مرتبة تصاعدياً حسب الأقدم أولاً.
    """
    query = db.query(Refund)
    if status_filter:
        query = query.filter(Refund.status == status_filter)
    return query.order_by(Refund.id.asc()).all()


def approve_refund(db: Session, refund_id: int, admin_user: User) -> Refund:
    """
    يعتمد طلب استرداد معلَّقاً (خطوة لازمة قبل process_refund).

    Args:
        db: جلسة قاعدة البيانات.
        refund_id: معرّف طلب الاسترداد.
        admin_user: المدير الذي ينفّذ الاعتماد.

    Returns:
        Refund: طلب الاسترداد بحالة approved.

    Raises:
        AppException: 400 إذا كان الطلب قد رُوجِع مسبقاً.
    """
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
    """
    يرفض طلب استرداد معلَّقاً مع ملاحظة اختيارية توضّح السبب.

    Args:
        db: جلسة قاعدة البيانات.
        refund_id: معرّف طلب الاسترداد.
        admin_user: المدير الذي ينفّذ الرفض.
        notes: سبب الرفض (اختياري).

    Returns:
        Refund: طلب الاسترداد بحالة declined.

    Raises:
        AppException: 400 إذا كان الطلب قد رُوجِع مسبقاً.
    """
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
    ينفّذ استرداداً معتمَداً فعلياً: يغيّر حالة الطلب إلى refunded، وإن
    كان صاحب الطلب وكيلاً (B2B) يُعاد المبلغ إلى محفظته مع تسجيل الحركة
    في agent_wallet_logs.

    Args:
        db: جلسة قاعدة البيانات.
        refund_id: معرّف طلب الاسترداد المعتمَد.
        admin_user: المدير الذي ينفّذ التنفيذ.

    Returns:
        Refund: طلب الاسترداد بحالة processed.

    Raises:
        AppException: 400 إذا لم يكن الطلب معتمَداً مسبقاً (approved).
    """
    refund = get_refund_or_404(db, refund_id)
    if refund.status != RefundStatus.approved:
        raise AppException("يجب اعتماد طلب الاسترداد أولاً قبل تنفيذه", status_code=400)

    order = order_service.get_order_or_404(db, refund.order_id)
    old_status = order.status
    order.status = OrderStatus.refunded
    db.add(
        OrderStatusLog(
            order_id=order.id,
            old_status=old_status,
            new_status=OrderStatus.refunded,
            changed_by=admin_user.id,
            notes=f"استرداد طلب رقم {order.order_number}",
        )
    )

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
