# File: app/services/password_reset_service.py

"""
طلب واستعادة كلمة المرور عبر رابط مُرسَل بالبريد الإلكتروني. الاستجابة
الناجحة لطلب الاستعادة عامة دائماً بغضّ النظر عن نتيجة البحث الفعلية،
لمنع اكتشاف الحسابات المسجَّلة (Account Enumeration).
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.password_reset_token import generate_reset_token, verify_reset_token
from app.core.security import hash_password
from app.models.user import User
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.services import audit_service
from app.services.email_service import send_password_reset_email


def request_password_reset(db: Session, payload: ForgotPasswordRequest) -> None:
    """
    يبحث عن مستخدم بالبريد/الهاتف المُدخَل، ويرسل له رابط استعادة كلمة
    مرور موقّعاً وصالحاً لمدة محدودة إن وُجد بريد إلكتروني مسجَّل لديه.
    لا يرفع أي استثناء ولا يكشف عن نتيجة البحث الفعلية للمتصل.

    Args:
        db: جلسة قاعدة البيانات.
        payload: المُعرّف (بريد أو هاتف) المُدخَل من المستخدم.
    """
    user = (
        db.query(User)
        .filter(or_(User.email == payload.identifier, User.phone == payload.identifier))
        .first()
    )
    if not user or not user.email or not user.password_hash:
        return

    expires_at, signature = generate_reset_token(user.id, user.token_version)
    send_password_reset_email(user, expires_at, signature)


def reset_password_with_token(db: Session, payload: ResetPasswordRequest) -> None:
    """
    يتحقق من صلاحية رابط الاستعادة ويضبط كلمة مرور جديدة للمستخدم، مع
    زيادة token_version لإبطال الرابط فوراً بعد الاستخدام ولإبطال أي
    جلسة قديمة كانت مفتوحة.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات الرابط الموقّع (uid، expires، signature) وكلمة
        المرور الجديدة.

    Raises:
        AppException: 400 إذا كان الرابط غير صالح أو منتهي الصلاحية أو
        المستخدم غير موجود.
    """
    user = db.query(User).filter(User.id == payload.uid).first()
    if not user or not verify_reset_token(user.id, user.token_version, payload.expires, payload.signature):
        raise AppException("رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية", status_code=400)

    user.password_hash = hash_password(payload.new_password)
    user.token_version += 1
    audit_service.log_action(db, user_id=user.id, action="reset_password_via_email", details={"user_id": user.id})
    db.commit()
