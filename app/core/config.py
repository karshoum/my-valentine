# File: app/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    إعدادات التطبيق المقروءة من متغيرات البيئة أو ملف .env.

    كل الحقول بلا قيمة افتراضية (DATABASE_URL, JWT_SECRET_KEY,
    SIGNED_URL_SECRET, CORS_ORIGINS) إلزامية ويجب توفيرها قبل تشغيل
    التطبيق؛ غيابها يوقف الإقلاع فوراً بدلاً من العمل بقيم غير آمنة
    ضمنية (مثال: CORS مفتوح للجميع).
    """

    APP_NAME: str = "Wakalat Paradise Platform"
    ENVIRONMENT: str = "development"

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12

    # تسجيل الدخول عبر قوقل (اختياري): يبقى None حتى تُوفَّر بيانات اعتماد
    # فعلية من Google Cloud Console؛ endpoint الدخول يرفض الطلب بوضوح قبل ذلك.
    GOOGLE_CLIENT_ID: str | None = None

    # بحث حجوزات الطيران عبر Duffel (اختياري): تبقى None حتى يُنشئ
    # الفريق حساب Duffel مجانياً ويوفّر مفتاح duffel_test (أو مفتاح
    # إنتاج حقيقي لاحقاً)؛ endpoint البحث يرفض الطلب بوضوح قبل ذلك.
    DUFFEL_API_KEY: str | None = None
    DUFFEL_BASE_URL: str = "https://api.duffel.com"
    DUFFEL_VERSION: str = "v2"

    # إرسال إشعارات الإيميل (اختياري): تبقى كلها None حتى يُوفَّر حساب
    # SMTP فعلي؛ عندها يُرسَل تأكيد الطلب وتحديثات الحالة تلقائياً، وأي
    # فشل في الإرسال لا يوقف تنفيذ العملية الأساسية (طلب/تحديث حالة).
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: str | None = None
    SMTP_FROM_EMAIL: str | None = None
    SMTP_USE_TLS: bool = True

    # Private file storage (passports, bankak receipts, ...).
    LOCAL_STORAGE_PATH: str = "storage/private"
    SIGNED_URL_SECRET: str
    SIGNED_URL_EXPIRE_SECONDS: int = 600

    CORS_ORIGINS: list[str]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
