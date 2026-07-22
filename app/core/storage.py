# File: app/core/storage.py

"""
تخزين آمن للمرفقات الحساسة (صور الجوازات، إشعارات بنكك، ...).

لا يتم أبداً تخزين أو تقديم هذه الملفات من مجلد عام قابل للوصول المباشر؛
كل ملف يُحفظ في مسار خاص (LOCAL_STORAGE_PATH) ولا يمكن جلبه إلا عبر رابط
موقّع (Signed URL) صالح لفترة زمنية محدودة، مطابقاً لنفس مبدأ S3
Presigned URLs. يمكن استبدال هذه الطبقة لاحقاً بتكامل مباشر مع S3 دون
تغيير أي كود في الخدمات التي تستخدمها.
"""

import hashlib
import hmac
import time
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings

PRIVATE_ROOT = Path(settings.LOCAL_STORAGE_PATH)
PRIVATE_ROOT.mkdir(parents=True, exist_ok=True)


def save_private_file(upload: UploadFile, subfolder: str) -> str:
    """
    يحفظ ملفاً مرفوعاً في مسار خاص غير عام تحت اسم عشوائي فريد، لمنع
    تخمين المسارات أو الوصول المباشر إليها.

    Args:
        upload: الملف المرفوع من العميل.
        subfolder: المجلد الفرعي المنطقي (مثال: "payment_receipts").

    Returns:
        str: المسار النسبي المخزَّن (subfolder/اسم_عشوائي.امتداد).
    """
    folder = PRIVATE_ROOT / subfolder
    folder.mkdir(parents=True, exist_ok=True)

    extension = Path(upload.filename or "").suffix
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = folder / stored_name

    with destination.open("wb") as buffer:
        buffer.write(upload.file.read())

    return f"{subfolder}/{stored_name}"


def resolve_private_path(relative_path: str) -> Path:
    """
    يحوّل مساراً نسبياً إلى مسار مطلق آمن داخل PRIVATE_ROOT فقط، ويرفض
    أي محاولة للخروج من هذا المجلد (Path Traversal).

    Args:
        relative_path: المسار النسبي المطلوب (كما يصل من رابط الطلب).

    Returns:
        Path: المسار المطلق المُحقَّق.

    Raises:
        ValueError: إذا كان المسار خارج PRIVATE_ROOT.
    """
    resolved = (PRIVATE_ROOT / relative_path).resolve()
    if PRIVATE_ROOT.resolve() not in resolved.parents and resolved != PRIVATE_ROOT.resolve():
        raise ValueError("مسار الملف غير صالح")
    return resolved


def _sign(path: str, expires_at: int) -> str:
    """يحسب توقيع HMAC-SHA256 لمسار وزمن انتهاء صلاحية معينين."""
    message = f"{path}:{expires_at}".encode()
    return hmac.new(settings.SIGNED_URL_SECRET.encode(), message, hashlib.sha256).hexdigest()


def generate_signed_url(path: str, expires_in: int | None = None) -> str:
    """
    يولّد رابطاً موقّعاً ومحدود الصلاحية لتقديم ملف خاص.

    Args:
        path: المسار النسبي المخزَّن للملف.
        expires_in: مدة الصلاحية بالثواني؛ افتراضياً SIGNED_URL_EXPIRE_SECONDS.

    Returns:
        str: رابط API كامل يتضمن وقت الانتهاء والتوقيع.
    """
    expires_at = int(time.time()) + (expires_in or settings.SIGNED_URL_EXPIRE_SECONDS)
    signature = _sign(path, expires_at)
    return f"/api/v1/files/{path}?expires={expires_at}&signature={signature}"


def verify_signed_url(path: str, expires: int, signature: str) -> bool:
    """
    يتحقق من صلاحية رابط موقّع: أنه لم تنتهِ مدته وأن التوقيع صحيح.

    Args:
        path: المسار النسبي المطلوب.
        expires: وقت الانتهاء المُرسَل في الرابط (Unix timestamp).
        signature: التوقيع المُرسَل في الرابط.

    Returns:
        bool: True إذا كان الرابط صالحاً وغير منتهي الصلاحية.
    """
    if int(time.time()) > expires:
        return False
    expected = _sign(path, expires)
    return hmac.compare_digest(expected, signature)
