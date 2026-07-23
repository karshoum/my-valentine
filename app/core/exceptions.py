# File: app/core/exceptions.py

import logging

logger = logging.getLogger("wakalat_baradais")


class AppException(Exception):
    """
    استثناء تطبيقي موحّد: يحمل رسالة عربية واضحة للواجهة الأمامية،
    مع إمكانية إرفاق تفاصيل تقنية دقيقة تُسجَّل في اللوجز الخلفية فقط
    ولا تُعرض أبداً للمستخدم النهائي.

    Args:
        message_ar: الرسالة العربية التي تُعرض للمستخدم كما هي.
        status_code: كود حالة HTTP المناسب (افتراضياً 400).
        technical_detail: تفصيل تقني اختياري يُسجَّل في اللوجز فقط.
    """

    def __init__(self, message_ar: str, status_code: int = 400, technical_detail: str | None = None):
        self.message_ar = message_ar
        self.status_code = status_code
        self.technical_detail = technical_detail
        super().__init__(message_ar)
