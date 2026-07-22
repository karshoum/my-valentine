import logging

logger = logging.getLogger("wakalat_baradis")


class AppException(Exception):
    """
    استثناء تطبيقي موحّد: يحمل رسالة عربية واضحة للواجهة الأمامية،
    مع إمكانية إرفاق تفاصيل تقنية دقيقة تُسجَّل في اللوجز الخلفية فقط
    ولا تُعرض أبداً للمستخدم النهائي.
    """

    def __init__(self, message_ar: str, status_code: int = 400, technical_detail: str | None = None):
        self.message_ar = message_ar
        self.status_code = status_code
        self.technical_detail = technical_detail
        super().__init__(message_ar)
