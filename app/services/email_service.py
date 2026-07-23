# File: app/services/email_service.py

"""
إرسال إشعارات الإيميل (تأكيد الطلب وتحديثات الحالة) عبر SMTP عام قابل
لأي مزوّد (Gmail SMTP، SendGrid SMTP relay، ...). طالما لم يُضبَط
SMTP_HOST بعد، الإرسال يُتجاوَز بصمت؛ وأي فشل اتصال لا يوقف تنفيذ
العملية الأساسية (إنشاء طلب أو تحديث حالته) - يُسجَّل في اللوجز فقط.
"""

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings
from app.models.enums import OrderStatus
from app.models.order import Order

logger = logging.getLogger(__name__)

ORDER_STATUS_LABELS_AR: dict[OrderStatus, str] = {
    OrderStatus.pending: "قيد المراجعة",
    OrderStatus.processing: "تم تأكيد الدفع، جارٍ التنفيذ",
    OrderStatus.in_system: "تم الحجز، جارٍ إصدار المستند النهائي",
    OrderStatus.completed: "مكتمل",
    OrderStatus.rejected: "مرفوض",
    OrderStatus.refunded: "مسترجَع",
}


def _send_email(to_email: str, subject: str, body: str) -> None:
    """
    يرسل رسالة نصية بسيطة عبر إعدادات SMTP الحالية. لا يرفع أي استثناء
    عند غياب الإعدادات أو فشل الاتصال؛ يكتفي بتسجيل تحذير في اللوجز.

    Args:
        to_email: عنوان بريد المستلم.
        subject: عنوان الرسالة.
        body: نص الرسالة.
    """
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.info("SMTP غير مُعدّ بعد؛ تم تجاوز إرسال الإيميل إلى %s", to_email)
        return

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as smtp_connection:
            if settings.SMTP_USE_TLS:
                smtp_connection.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                smtp_connection.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            smtp_connection.send_message(message)
    except (smtplib.SMTPException, OSError):
        logger.exception("فشل إرسال إيميل إلى %s", to_email)


def send_order_confirmation_email(order: Order) -> None:
    """يرسل إيميل تأكيد استلام الطلب لصاحبه فور إنشائه، إن كان لديه بريد إلكتروني مسجَّل."""
    recipient_email = order.customer.email
    if not recipient_email:
        return

    subject = f"تأكيد استلام طلبك {order.order_number} — وكالة براديس"
    body = (
        f"مرحباً {order.customer.full_name}،\n\n"
        f"تم استلام طلبك رقم {order.order_number} بنجاح وهو الآن قيد المراجعة.\n"
        "سنُعلمك عبر هذا البريد فور تحديث حالته.\n\n"
        "وكالة براديس"
    )
    _send_email(recipient_email, subject, body)


def send_order_status_update_email(order: Order) -> None:
    """يرسل إيميل تحديث حالة الطلب لصاحبه عند كل انتقال حالة، إن كان لديه بريد إلكتروني مسجَّل."""
    recipient_email = order.customer.email
    if not recipient_email:
        return

    status_label = ORDER_STATUS_LABELS_AR.get(order.status, order.status.value)
    subject = f"تحديث حالة طلبك {order.order_number} — وكالة براديس"
    body = (
        f"مرحباً {order.customer.full_name}،\n\n"
        f"تم تحديث حالة طلبك رقم {order.order_number} إلى: {status_label}.\n\n"
        "وكالة براديس"
    )
    _send_email(recipient_email, subject, body)
