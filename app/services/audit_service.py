# File: app/services/audit_service.py

from typing import Any

from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_action(
    db: Session,
    user_id: int | None,
    action: str,
    details: dict[str, Any] | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    """
    يسجّل حركة إدارية أو مالية حساسة (تغيير سعر صرف، موافقة على مسترد،
    تعديل صلاحية، ...) في جدول audit_logs. لا يُستدعى أبداً داخل
    try/except صامت؛ فشل التسجيل يجب أن يُفشل العملية نفسها.

    Args:
        db: جلسة قاعدة البيانات الحالية (لم تُنفَّذ commit بعد).
        user_id: معرّف المستخدم الذي نفّذ الحركة (قد يكون None لحركة نظامية).
        action: اسم الحركة (مثال: "update_currency_rate").
        details: تفاصيل إضافية حرة بصيغة JSON.
        ip_address: عنوان IP الذي صدر منه الطلب، إن توفّر.

    Returns:
        AuditLog: سجل التدقيق المُضاف إلى الجلسة (غير محفوظ بعد commit).
    """
    entry = AuditLog(user_id=user_id, action=action, details=details, ip_address=ip_address)
    db.add(entry)
    return entry
