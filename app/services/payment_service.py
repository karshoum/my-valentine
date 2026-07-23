# File: app/services/payment_service.py

"""
آلية الدفع الهجينة (بنكك / فيزا / محفظة الوكيل).

القاعدة الصارمة: لا يتم تأكيد أي طلب تلقائياً بعد رفع إشعار بنكك أو
الدفع بالفيزا. يبقى الطلب بحالة pending حتى يراجع موظف أو مدير الإشعار
ويؤكد الدفع يدوياً عبر verify_payment، عندها فقط تنتقل حالة الطلب إلى
processing.
"""

from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.storage import save_private_file
from app.models.enums import OrderStatus, PaymentMethod, PaymentStatus
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentSubmitRequest
from app.services import audit_service, order_service


def submit_payment(
    db: Session,
    order_id: int,
    current_user: User,
    payload: PaymentSubmitRequest,
    receipt_file: UploadFile | None,
) -> Payment:
    """
    يسجّل محاولة دفع جديدة (بنكك أو فيزا) لطلب قائم، بحالة pending دائماً
    حتى تُراجَع يدوياً لاحقاً.

    Args:
        db: جلسة قاعدة البيانات.
        order_id: معرّف الطلب المُراد سداده.
        current_user: صاحب الطلب (عميل أو وكيل).
        payload: طريقة الدفع والمبلغ ومرجع التحويل إن وُجد.
        receipt_file: صورة إشعار التحويل (إلزامية لطريقة بنكك).

    Returns:
        Payment: سجل الدفع المُنشَأ بحالة pending.

    Raises:
        AppException: 400 إذا لم يكن الطلب بحالة pending، أو كانت طريقة
        الدفع محفظة وكيل (تُخصَم تلقائياً فقط)، أو لم تُرفَق صورة إشعار
        بنكك.
    """
    order = order_service.get_order_with_access_check(db, order_id, current_user)

    if order.status != OrderStatus.pending:
        raise AppException("لا يمكن رفع إثبات دفع لطلب تجاوز مرحلة الانتظار", status_code=400)

    if payload.payment_method == PaymentMethod.agent_wallet:
        raise AppException("لا يمكن رفع إثبات دفع يدوي لمحفظة الوكيل؛ الخصم يتم تلقائياً عند إنشاء الطلب", status_code=400)

    if payload.payment_method == PaymentMethod.bankak and receipt_file is None:
        raise AppException("يجب إرفاق صورة إشعار التحويل (بنكك)", status_code=400)

    receipt_path = None
    if receipt_file is not None:
        receipt_path = save_private_file(receipt_file, subfolder="payment_receipts")

    payment = Payment(
        order_id=order.id,
        payment_method=payload.payment_method,
        amount=payload.amount,
        currency_code=payload.currency_code or order.currency_code,
        receipt_image_url=receipt_path,
        transaction_ref=payload.transaction_ref,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def get_payment_or_404(db: Session, payment_id: int) -> Payment:
    """يجلب سجل دفع بمعرّفه أو يرفع استثناء 404 إذا لم يوجد."""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise AppException("سجل الدفع غير موجود", status_code=404)
    return payment


def list_payments(db: Session, status_filter: PaymentStatus | None = None) -> list[Payment]:
    """
    يُعيد كل محاولات الدفع لأغراض مراجعة الموظف/المدير، مع تصفية
    اختيارية حسب الحالة (لعرض المعلَّقة فقط عادة، وهي طابور عمل المراجعة).

    Args:
        db: جلسة قاعدة البيانات.
        status_filter: حالة اختيارية للتصفية بها (مثال: PaymentStatus.pending).

    Returns:
        list[Payment]: محاولات الدفع مرتبة تصاعدياً حسب تاريخ الإنشاء
        (الأقدم أولاً، لأنه غالباً الأولى بالمراجعة).
    """
    query = db.query(Payment)
    if status_filter:
        query = query.filter(Payment.status == status_filter)
    return query.order_by(Payment.created_at.asc()).all()


def verify_payment(db: Session, payment_id: int, approve: bool, notes: str | None, employee: User) -> Payment:
    """
    يراجع موظف/مدير محاولة دفع معلَّقة ويقرّر قبولها أو رفضها. القبول
    فقط هو ما ينقل الطلب من pending إلى processing.

    Args:
        db: جلسة قاعدة البيانات.
        payment_id: معرّف سجل الدفع المُراد مراجعته.
        approve: True لتأكيد الدفع، False لرفضه.
        notes: ملاحظة اختيارية ترافق القرار.
        employee: الموظف/المدير الذي ينفّذ المراجعة.

    Returns:
        Payment: سجل الدفع بعد تحديث حالته.

    Raises:
        AppException: 404 إذا لم يوجد سجل الدفع، أو 400 إذا كان قد رُوجِع
        مسبقاً.
    """
    payment = get_payment_or_404(db, payment_id)

    if payment.status != PaymentStatus.pending:
        raise AppException("تمت مراجعة هذا الدفع مسبقاً", status_code=400)

    payment.status = PaymentStatus.verified if approve else PaymentStatus.rejected
    payment.verified_by = employee.id
    payment.verified_at = datetime.now(timezone.utc)

    audit_service.log_action(
        db,
        user_id=employee.id,
        action="verify_payment",
        details={"payment_id": payment.id, "approved": approve, "notes": notes},
    )

    if approve:
        order_service.update_order_status(
            db, payment.order_id, OrderStatus.processing, employee, notes or "تم تأكيد الدفع يدوياً"
        )

    db.commit()
    db.refresh(payment)
    return payment
