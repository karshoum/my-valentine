# File: app/core/security.py

from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def hash_password(password: str) -> str:
    """يُشفّر كلمة مرور نصية باستخدام bcrypt ويُعيد الـ hash الناتج."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """يقارن كلمة مرور نصية بـ hash محفوظ، ويُعيد True عند التطابق."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    يُصدر توكن JWT موقّعاً يحمل الحمولة المُمرَّرة (عادة {"sub": user_id,
    "role": role}) مع وقت انتهاء صلاحية.

    Args:
        data: الحمولة (claims) المراد تضمينها في التوكن.
        expires_delta: مدة الصلاحية؛ افتراضياً ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        str: التوكن الموقّع الجاهز للإرسال للعميل.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    يفكّ تشفير توكن JWT ويتحقق من توقيعه وصلاحيته.

    Args:
        token: التوكن الخام المستلم من الترويسة Authorization.

    Returns:
        dict: الحمولة (claims) المفكوكة عند نجاح التحقق.

    Raises:
        HTTPException: 401 إذا كان التوكن غير صالح أو منتهي الصلاحية.
    """
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="جلسة الدخول غير صالحة أو منتهية، يرجى تسجيل الدخول مرة أخرى",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """
    تبعية FastAPI تستخرج المستخدم الحالي من توكن JWT المرسل في الترويسة.

    Args:
        token: التوكن المستخرَج تلقائياً بواسطة oauth2_scheme.
        db: جلسة قاعدة البيانات.

    Returns:
        User: صف المستخدم النشط المطابق للتوكن.

    Raises:
        HTTPException: 401 إذا كان التوكن/المستخدم غير صالح أو صادراً
        قبل آخر تغيير لكلمة المرور، أو 403 إذا كان الحساب موقوفاً.
    """
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="بيانات الدخول غير صالحة")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="المستخدم غير موجود")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="هذا الحساب موقوف، يرجى التواصل مع الإدارة")

    # توكنات صادرة قبل هذا التغيير لا تحمل "tv"؛ نعتبرها 0 (القيمة
    # الافتراضية) حفاظاً على توافق الجلسات النشطة وقت النشر.
    if payload.get("tv", 0) != user.token_version:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="انتهت صلاحية هذه الجلسة، يرجى تسجيل الدخول مرة أخرى",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
