# File: app/schemas/payment_settings.py

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PaymentSettingsOut(BaseModel):
    """تمثيل إعداد وسائل الدفع الحالي في الاستجابات (يُستهلَك من شاشة الدفع للعميل ومن لوحة الإدارة)."""

    model_config = ConfigDict(from_attributes=True)

    bankak_account_number: str | None
    bankak_account_name: str | None
    bankak_is_enabled: bool
    visa_whatsapp_number: str | None
    visa_is_enabled: bool
    updated_at: datetime | None


class PaymentSettingsUpdateRequest(BaseModel):
    """طلب تحديث إعداد وسائل الدفع (admin فقط) — كل الحقول اختيارية، المُرسَل منها فقط يُطبَّق."""

    bankak_account_number: str | None = None
    bankak_account_name: str | None = None
    bankak_is_enabled: bool | None = None
    visa_whatsapp_number: str | None = None
    visa_is_enabled: bool | None = None
