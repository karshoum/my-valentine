# File: app/core/rate_limit.py

"""
حماية بسيطة من محاولات تخمين كلمة المرور (Brute Force) على تسجيل
الدخول، بدون الحاجة لبنية تحتية إضافية (Redis وغيره).

القيود المعروفة: التخزين في ذاكرة العملية (in-memory) فقط، فلا يصلح
لنشر متعدد النسخ (Multi-instance) بدون مشاركة الحالة عبر Redis أو ما
شابه. كافٍ للنشر بنسخة واحدة (single instance)، وهو الوضع الحالي
للمشروع.
"""

import time

from app.core.exceptions import AppException

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_WINDOW_SECONDS = 15 * 60

_failed_attempts: dict[str, list[float]] = {}


def _prune_expired(key: str) -> list[float]:
    """يحذف محاولات الفشل الأقدم من نافذة القفل، ويُعيد المتبقي منها."""
    now = time.time()
    recent = [t for t in _failed_attempts.get(key, []) if now - t < LOCKOUT_WINDOW_SECONDS]
    _failed_attempts[key] = recent
    return recent


def check_not_locked_out(key: str) -> None:
    """
    يتحقق من أن المُعرّف (بريد/هاتف) لم يتجاوز الحد الأقصى لمحاولات
    الدخول الفاشلة خلال نافذة القفل الحالية.

    Args:
        key: مُعرّف الدخول المُستخدَم في محاولة تسجيل الدخول.

    Raises:
        AppException: 429 إذا تجاوز عدد المحاولات الفاشلة الحد المسموح.
    """
    if len(_prune_expired(key)) >= MAX_FAILED_ATTEMPTS:
        raise AppException(
            "محاولات دخول فاشلة كثيرة على هذا الحساب، يرجى المحاولة مرة أخرى بعد 15 دقيقة",
            status_code=429,
        )


def record_failed_attempt(key: str) -> None:
    """يسجّل محاولة دخول فاشلة جديدة لمُعرّف معيّن."""
    _failed_attempts.setdefault(key, []).append(time.time())


def reset_attempts(key: str) -> None:
    """يمسح سجل المحاولات الفاشلة لمُعرّف معيّن (يُستدعى بعد دخول ناجح)."""
    _failed_attempts.pop(key, None)
