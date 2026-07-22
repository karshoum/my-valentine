# File: app/schemas/audit.py

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class AuditLogOut(BaseModel):
    """تمثيل سطر واحد من سجل التدقيق (audit_logs) في الاستجابات."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    action: str
    details: dict[str, Any] | None
    ip_address: str | None
    created_at: datetime
