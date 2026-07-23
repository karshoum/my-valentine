# File: app/services/order_service.py

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
from app.services import agent_service, currency_service, email_service, service_service
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
    """يولّد رقم طلب فريد بصيغة WB-YYMMDD-XXXXX."""
    timestamp_part = datetime.now(timezone.utc).strftime("%y%m%d")
    random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"WB-{timestamp_part}-{random_part}"


def create_order(db: Session, current_user: User, payload: OrderCreateRequest) -> Order:
    """
    ينشئ طلباً جديداً بحالة pending، مع حساب السعر الفعلي وتحويله للعملة
    المطلوبة، وخصم قيمته تلقائياً إذا كان الطالب وكيلاً بوضع دفع مسبق أو
    حد ائتماني.

    Args:
        db: جلسة قاعدة البيانات.
        current_user: المستخدم صاحب الطلب (عميل أو وكيل).
        payload: الخدمة المطلوبة، عملة السداد، وقائمة المسافرين.

    Returns:
        Order: الطلب المُنشَأ حديثاً مع مسافريه وسجل حالته الأول.

    Raises:
        AppException: 400 إذا كانت الخدمة غير مفعَّلة، أو إذا فشل خصم
        محفظة الوكيل (رصيد/حد ائتماني غير كافٍ).
    """
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
    email_service.send_order_confirmation_email(order)
    return order


def get_order_or_404(db: Session, order_id: int) -> Order:
    """يجلب طلباً بمعرّفه أو يرفع استثناء 404 إذا لم يوجد."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise AppException("الطلب غير موجود", status_code=404)
    return order


def get_order_with_access_check(db: Session, order_id: int, current_user: User) -> Order:
    """
    يجلب طلباً مع التحقق من صلاحية الوصول: الموظف/المدير يرى كل الطلبات،
    وأي مستخدم آخر يرى طلباته الخاصة فقط.

    Args:
        db: جلسة قاعدة البيانات.
        order_id: معرّف الطلب المطلوب.
        current_user: المستخدم الحالي.

    Returns:
        Order: الطلب المطابق.

    Raises:
        AppException: 404 إذا لم يوجد الطلب، أو 403 إذا لم يملك المستخدم
        صلاحية الاطلاع عليه.
    """
    order = get_order_or_404(db, order_id)
    if current_user.role in (UserRole.admin, UserRole.employee):
        return order
    if order.user_id != current_user.id:
        raise AppException("ليس لديك صلاحية للاطلاع على هذا الطلب", status_code=403)
    return order


def list_orders_for_user(db: Session, current_user: User) -> list[Order]:
    """
    يُعيد طلبات المستخدم الحالي، أو كل الطلبات إذا كان موظفاً/مديراً.

    Args:
        db: جلسة قاعدة البيانات.
        current_user: المستخدم الحالي.

    Returns:
        list[Order]: الطلبات مرتبة تنازلياً حسب تاريخ الإنشاء.
    """
    query = db.query(Order)
    if current_user.role not in (UserRole.admin, UserRole.employee):
        query = query.filter(Order.user_id == current_user.id)
    return query.order_by(Order.created_at.desc()).all()


def update_order_status(
    db: Session, order_id: int, new_status: OrderStatus, employee: User, notes: str | None
) -> Order:
    """
    ينقل حالة طلب إلى حالة جديدة وفق مصفوفة الانتقالات المسموحة فقط،
    ويسجّل التغيير في order_status_logs مع معرّف الموظف المُنفِّذ.

    Args:
        db: جلسة قاعدة البيانات.
        order_id: معرّف الطلب المستهدَف.
        new_status: الحالة الجديدة المطلوب الانتقال إليها.
        employee: الموظف/المدير الذي ينفّذ التغيير.
        notes: ملاحظة اختيارية ترافق التغيير.

    Returns:
        Order: الطلب بعد تحديث حالته.

    Raises:
        AppException: 404 إذا لم يوجد الطلب، أو 400 إذا كان الانتقال
        المطلوب غير مسموح من الحالة الحالية.
    """
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
    email_service.send_order_status_update_email(order)
    return order
