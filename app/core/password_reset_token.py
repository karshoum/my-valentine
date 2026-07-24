# File: app/core/password_reset_token.py

"""
توليد والتحقق من رابط استعادة كلمة المرور، بنفس مبدأ التوقيع
(HMAC-SHA256) المستخدم في روابط الملفات الموقّعة (app/core/storage.py)،
لكن بحمولة مختلفة تخص استعادة كلمة المرور فقط. تضمين token_version في
الحمولة الموقّعة يجعل الرابط يُبطَل تلقائياً بعد أول استخدام (لأن
إعادة التعيين تزيد token_version)، أو عند أي تغيير آخر لكلمة المرور،
دون الحاجة لجدول توكنات منفصل في قاعدة البيانات.
"""

import hashlib
import hmac
import time

from app.core.config import settings

RESET_TOKEN_EXPIRE_SECONDS = 30 * 60


def _sign_reset_token(user_id: int, token_version: int, expires_at: int) -> str:
    """يحسب توقيع HMAC-SHA256 لطلب استعادة كلمة مرور معيّن."""
    message = f"pwreset:{user_id}:{token_version}:{expires_at}".encode()
    return hmac.new(settings.SIGNED_URL_SECRET.encode(), message, hashlib.sha256).hexdigest()


def generate_reset_token(user_id: int, token_version: int) -> tuple[int, str]:
    """
    يولّد وقت انتهاء وتوقيعاً لرابط استعادة كلمة مرور جديد.

    Args:
        user_id: معرّف المستخدم طالب الاستعادة.
        token_version: قيمة token_version الحالية للمستخدم وقت الإصدار.

    Returns:
        tuple[int, str]: (وقت الانتهاء Unix timestamp، التوقيع).
    """
    expires_at = int(time.time()) + RESET_TOKEN_EXPIRE_SECONDS
    signature = _sign_reset_token(user_id, token_version, expires_at)
    return expires_at, signature


def verify_reset_token(user_id: int, token_version: int, expires_at: int, signature: str) -> bool:
    """
    يتحقق من صلاحية رابط استعادة كلمة مرور: أنه لم تنتهِ مدته، وأن
    token_version الحالي للمستخدم مطابق لما وُقِّع وقت الإصدار (أي لم
    يُستخدَم الرابط من قبل ولم تتغيّر كلمة المرور بطريقة أخرى)، وأن
    التوقيع صحيح.

    Args:
        user_id: معرّف المستخدم صاحب الرابط.
        token_version: قيمة token_version الحالية للمستخدم في قاعدة البيانات.
        expires_at: وقت الانتهاء المُرسَل في الرابط.
        signature: التوقيع المُرسَل في الرابط.

    Returns:
        bool: True إذا كان الرابط صالحاً وغير منتهي الصلاحية.
    """
    if int(time.time()) > expires_at:
        return False
    expected = _sign_reset_token(user_id, token_version, expires_at)
    return hmac.compare_digest(expected, signature)
