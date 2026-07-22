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
    يسجّل كل حركة مالية أو إدارية حساسة (تغيير سعر صرف، موافقة على مسترد،
    تعديل صلاحية، ...) في جدول audit_logs. لا يُستخدم هذا الاستدعاء أبداً
    داخل try/except صامت؛ فشل التسجيل يجب أن يفشل العملية نفسها.
    """
    entry = AuditLog(user_id=user_id, action=action, details=details, ip_address=ip_address)
    db.add(entry)
    return entry
