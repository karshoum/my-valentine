# File: app/services/email_service.py

"""
إرسال إشعارات الإيميل (تأكيد الطلب وتحديثات الحالة) عبر SMTP عام قابل
لأي مزوّد (Gmail SMTP، SendGrid SMTP relay، ...)، بالهوية البصرية
الموحّدة للوكالة (انظر app/services/email_templates.py). طالما لم
يُضبَط SMTP_HOST بعد، الإرسال يُتجاوَز بصمت؛ وأي فشل اتصال لا يوقف
تنفيذ العملية الأساسية (إنشاء طلب أو تحديث حالته) - يُسجَّل في اللوجز فقط.
"""

import logging
import smtplib
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config import settings
from app.models.enums import OrderStatus
from app.models.order import Order
from app.services.email_templates import LOGO_CONTENT_ID, load_logo_bytes, render_html_email

logger = logging.getLogger("wakalat_paradise")

ORDER_STATUS_LABELS_AR: dict[OrderStatus, str] = {
    OrderStatus.pending: "قيد المراجعة",
    OrderStatus.processing: "تم تأكيد الدفع، جارٍ التنفيذ",
    OrderStatus.in_system: "تم الحجز، جارٍ إصدار المستند النهائي",
    OrderStatus.completed: "مكتمل",
    OrderStatus.rejected: "مرفوض",
    OrderStatus.refunded: "مسترجَع",
}


def _send_branded_email(to_email: str, subject: str, heading: str, paragraphs: list[str]) -> None:
    """
    يرسل إيميلاً بالهوية البصرية الموحّدة للوكالة (شعار + نسخة HTML)، مع
    نسخة نصية بديلة لعملاء البريد التي لا تدعم HTML.

    Args:
        to_email: عنوان بريد المستلم.
        subject: عنوان الرسالة.
        heading: عنوان المحتوى داخل قالب الإيميل.
        paragraphs: فقرات نص الرسالة.
    """
    if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
        logger.info("SMTP غير مُعدّ بعد؛ تم تجاوز إرسال الإيميل إلى %s", to_email)
        return

    message = MIMEMultipart("related")
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email

    alternative = MIMEMultipart("alternative")
    alternative.attach(MIMEText("\n\n".join(paragraphs), "plain", "utf-8"))
    alternative.attach(MIMEText(render_html_email(heading, paragraphs), "html", "utf-8"))
    message.attach(alternative)

    logo_bytes = load_logo_bytes()
    if logo_bytes:
        logo_image = MIMEImage(logo_bytes, _subtype="png")
        logo_image.add_header("Content-ID", f"<{LOGO_CONTENT_ID}>")
        logo_image.add_header("Content-Disposition", "inline", filename="logo.png")
        message.attach(logo_image)

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

    _send_branded_email(
        recipient_email,
        subject=f"تأكيد استلام طلبك {order.order_number} — وكالة برادايس",
        heading=f"مرحباً {order.customer.full_name}",
        paragraphs=[
            f"تم استلام طلبك رقم <strong>{order.order_number}</strong> بنجاح وهو الآن قيد المراجعة.",
            "سنُعلمك عبر هذا البريد فور تحديث حالته.",
        ],
    )


def send_order_status_update_email(order: Order) -> None:
    """يرسل إيميل تحديث حالة الطلب لصاحبه عند كل انتقال حالة، إن كان لديه بريد إلكتروني مسجَّل."""
    recipient_email = order.customer.email
    if not recipient_email:
        return

    status_label = ORDER_STATUS_LABELS_AR.get(order.status, order.status.value)
    _send_branded_email(
        recipient_email,
        subject=f"تحديث حالة طلبك {order.order_number} — وكالة برادايس",
        heading=f"مرحباً {order.customer.full_name}",
        paragraphs=[f"تم تحديث حالة طلبك رقم <strong>{order.order_number}</strong> إلى: {status_label}."],
    )
