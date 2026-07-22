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
    folder = PRIVATE_ROOT / subfolder
    folder.mkdir(parents=True, exist_ok=True)

    extension = Path(upload.filename or "").suffix
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = folder / stored_name

    with destination.open("wb") as buffer:
        buffer.write(upload.file.read())

    return f"{subfolder}/{stored_name}"


def resolve_private_path(relative_path: str) -> Path:
    resolved = (PRIVATE_ROOT / relative_path).resolve()
    if PRIVATE_ROOT.resolve() not in resolved.parents and resolved != PRIVATE_ROOT.resolve():
        raise ValueError("مسار الملف غير صالح")
    return resolved


def _sign(path: str, expires_at: int) -> str:
    message = f"{path}:{expires_at}".encode()
    return hmac.new(settings.SIGNED_URL_SECRET.encode(), message, hashlib.sha256).hexdigest()


def generate_signed_url(path: str, expires_in: int | None = None) -> str:
    expires_at = int(time.time()) + (expires_in or settings.SIGNED_URL_EXPIRE_SECONDS)
    signature = _sign(path, expires_at)
    return f"/api/v1/files/{path}?expires={expires_at}&signature={signature}"


def verify_signed_url(path: str, expires: int, signature: str) -> bool:
    if int(time.time()) > expires:
        return False
    expected = _sign(path, expires)
    return hmac.compare_digest(expected, signature)
