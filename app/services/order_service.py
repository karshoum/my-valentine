"""
دورة حياة الطلب (Order Workflow).

كل طلب يبدأ بحالة pending ولا يمكن أن يتحرك إلى حالة أخرى إلا عبر
update_order_status، والتي تتحقق من مصفوفة الانتقالات المسموحة وتُسجّل
كل تغيير في order_status_logs مع معرف الموظف الذي قام بالتعديل.
"""

import random
import string
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.agent import AgentProfile
from app.models.enums import OrderStatus, UserRole
from app.models.order import Order, OrderPassenger, OrderStatusLog
from app.models.user import User
from app.schemas.order import OrderCreateRequest
from app.services import agent_service, currency_service, service_service
from app.services.wallet_service import deduct_for_order

ALLOWED_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.pending: {OrderStatus.processing, OrderStatus.rejected},
    OrderStatus.processing: {OrderStatus.in_system, OrderStatus.rejected},
    OrderStatus.in_system: {OrderStatus.completed},
    OrderStatus.completed: {OrderStatus.refunded},
    OrderStatus.rejected: set(),
    OrderStatus.refunded: set(),
}


def _generate_order_number() -> str:
    timestamp_part = datetime.now(timezone.utc).strftime("%y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"WB-{timestamp_part}-{random_part}"


def create_order(db: Session, current_user: User, payload: OrderCreateRequest) -> Order:
    service = service_service.get_service_or_404(db, payload.service_id)
    if not service.is_active:
        raise AppException("هذه الخدمة غير متاحة حالياً", status_code=400)

    agent: AgentProfile | None = None
    if current_user.role == UserRole.agent:
        agent = agent_service.get_agent_by_user_or_404(db, current_user.id)

    price_usd = agent_service.get_effective_price_usd(db, service, agent)
    total_amount = currency_service.convert_usd_to(db, price_usd, payload.currency_code)

    order = Order(
        order_number=_generate_order_number(),
        user_id=current_user.id,
        service_id=service.id,
        total_amount=total_amount,
        currency_code=payload.currency_code.upper(),
        status=OrderStatus.pending,
    )
    db.add(order)
    db.flush()

    for passenger in payload.passengers:
        db.add(OrderPassenger(order_id=order.id, **passenger.model_dump()))

    db.add(
        OrderStatusLog(
            order_id=order.id,
            old_status=None,
            new_status=OrderStatus.pending,
            changed_by=current_user.id,
            notes="إنشاء الطلب",
        )
    )

    # الوكلاء أصحاب المحفظة المسبقة أو الحد الائتماني يُخصَم منهم تلقائياً وفورياً،
    # أما pay_per_order فيمر عبر نفس مسار الدفع اليدوي (بنكك/فيزا) مثل العميل العادي.
    if agent and agent.payment_mode.value != "pay_per_order":
        deduct_for_order(db, agent, order)

    db.commit()
    db.refresh(order)
    return order


def get_order_or_404(db: Session, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppException("الطلب غير موجود", status_code=404)
    return order


def get_order_with_access_check(db: Session, order_id: int, current_user: User) -> Order:
    order = get_order_or_404(db, order_id)
    if current_user.role in (UserRole.admin, UserRole.employee):
        return order
    if order.user_id != current_user.id:
        raise AppException("ليس لديك صلاحية للاطلاع على هذا الطلب", status_code=403)
    return order


def list_orders_for_user(db: Session, current_user: User) -> list[Order]:
    query = db.query(Order)
    if current_user.role not in (UserRole.admin, UserRole.employee):
        query = query.filter(Order.user_id == current_user.id)
    return query.order_by(Order.created_at.desc()).all()


def update_order_status(
    db: Session, order_id: int, new_status: OrderStatus, employee: User, notes: str | None
) -> Order:
    order = get_order_or_404(db, order_id)

    allowed_next = ALLOWED_TRANSITIONS.get(order.status, set())
    if new_status not in allowed_next:
        raise AppException(
            f"لا يمكن الانتقال من حالة '{order.status.value}' إلى '{new_status.value}'",
            status_code=400,
        )

    old_status = order.status
    order.status = new_status

    db.add(
        OrderStatusLog(
            order_id=order.id,
            old_status=old_status,
            new_status=new_status,
            changed_by=employee.id,
            notes=notes,
        )
    )
    db.commit()
    db.refresh(order)
    return order
