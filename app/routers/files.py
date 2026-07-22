# File: app/routers/files.py

from fastapi import APIRouter, Query
from fastapi.responses import FileResponse

from app.core.exceptions import AppException
from app.core.storage import resolve_private_path, verify_signed_url

router = APIRouter(prefix="/api/v1/files", tags=["ملفات موقّعة (جوازات / إشعارات دفع)"])


@router.get("/{file_path:path}")
def get_signed_file(file_path: str, expires: int = Query(...), signature: str = Query(...)) -> FileResponse:
    """
    تقديم المرفقات الحساسة (صور جوازات، إشعارات بنكك) عبر رابط موقّع
    وصالح لفترة محدودة فقط (Signed URL)، بنفس مبدأ S3 Presigned URLs.
    لا يوجد أي مسار آخر في النظام يقدّم هذه الملفات مباشرة.

    Args:
        file_path: المسار النسبي للملف المطلوب.
        expires: وقت انتهاء صلاحية الرابط (Unix timestamp).
        signature: توقيع HMAC المُرفَق بالرابط.

    Returns:
        FileResponse: محتوى الملف إذا كان الرابط صالحاً.

    Raises:
        AppException: 403 إذا كان الرابط غير صالح/منتهياً، 400 إذا كان
        المسار غير صالح، أو 404 إذا لم يوجد الملف.
    """
    if not verify_signed_url(file_path, expires, signature):
        raise AppException("رابط الملف غير صالح أو منتهي الصلاحية", status_code=403)

    try:
        resolved_path = resolve_private_path(file_path)
    except ValueError:
        raise AppException("مسار الملف غير صالح", status_code=400)

    if not resolved_path.is_file():
        raise AppException("الملف غير موجود", status_code=404)

    return FileResponse(resolved_path)
