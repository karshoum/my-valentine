# File: app/services/order_deliverable_service.py

"""
إرفاق المستند النهائي لطلب (تذكرة، فيزا، أو أي مخرج فعلي للخدمة) بعد
أن يُتمّ الموظف الحجز الفعلي خارج النظام (عادة على موقع الناقل/السفارة).
لا علاقة لهذا بإثبات الدفع (payment_service) ولا بمرفقات المسافرين.
"""

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.storage import save_private_file
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.user import User
from app.services import audit_service, order_service

ELIGIBLE_STATUSES_FOR_DELIVERABLE = (OrderStatus.in_system, OrderStatus.completed)


def attach_deliverable_file(db: Session, order_id: int, deliverable_file: UploadFile, staff_user: User) -> Order:
    """
    يرفع ويربط المستند النهائي لطلب وصل لمرحلة "في السيستم" على الأقل
    (أي أن الموظف أتمّ الحجز الفعلي خارجياً وحصل على التذكرة/الفيزا).

    Args:
        db: جلسة قاعدة البيانات.
        order_id: معرّف الطلب المستهدَف.
        deliverable_file: ملف المستند (تذكرة/فيزا/إلخ) المرفوع من الموظف.
        staff_user: الموظف/المدير الذي ينفّذ الرفع.

    Returns:
        Order: الطلب بعد إرفاق المستند.

    Raises:
        AppException: 404 إذا لم يوجد الطلب، أو 400 إذا لم تصل حالته
        بعد إلى "في السيستم" (لا معنى لمستند نهائي قبل إتمام الحجز الفعلي).
    """
    order = order_service.get_order_or_404(db, order_id)

    if order.status not in ELIGIBLE_STATUSES_FOR_DELIVERABLE:
        raise AppException(
            "لا يمكن رفع المستند النهائي إلا بعد وصول الطلب لحالة 'في السيستم' على الأقل",
            status_code=400,
        )

    stored_path = save_private_file(deliverable_file, subfolder="order_deliverables")
    order.deliverable_file_url = stored_path

    audit_service.log_action(
        db, user_id=staff_user.id, action="attach_order_deliverable", details={"order_id": order.id}
    )
    db.commit()
    db.refresh(order)
    return order
