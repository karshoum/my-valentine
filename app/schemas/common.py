# File: app/schemas/common.py

from pydantic import BaseModel


class MessageResponse(BaseModel):
    """استجابة نصية عامة بسيطة (رسالة نجاح/تأكيد)."""

    message: str
