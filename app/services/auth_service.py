# File: app/services/auth_service.py

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.rate_limit import check_not_locked_out, record_failed_attempt, reset_attempts
from app.core.security import create_access_token, hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest, LoginRequest, RegisterRequest, TokenResponse


def register_customer(db: Session, payload: RegisterRequest) -> User:
    """
    يسجّل حساب عميل جديد (B2C) بعد التأكد من عدم تكرار البريد أو الهاتف.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات التسجيل (الاسم، البريد، الهاتف، كلمة المرور).

    Returns:
        User: حساب العميل المُنشَأ حديثاً.

    Raises:
        AppException: 409 إذا كان البريد أو الهاتف مسجلاً مسبقاً.
    """
    existing_filters = [User.phone == payload.phone]
    if payload.email:
        existing_filters.append(User.email == payload.email)

    existing = db.query(User).filter(or_(*existing_filters)).first()
    if existing:
        raise AppException("البريد الإلكتروني أو رقم الهاتف مسجل مسبقاً", status_code=409)

    user = User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=UserRole.customer,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate(db: Session, payload: LoginRequest) -> TokenResponse:
    """
    يتحقق من بيانات تسجيل الدخول (بريد/هاتف + كلمة مرور) ويصدر توكن JWT.

    Args:
        db: جلسة قاعدة البيانات.
        payload: المُعرّف (بريد أو هاتف) وكلمة المرور.

    Returns:
        TokenResponse: التوكن الموقّع مع دور المستخدم واسمه.

    Raises:
        AppException: 401 إذا كانت بيانات الدخول خاطئة، 403 إذا كان
        الحساب موقوفاً، أو 429 إذا تجاوزت محاولات الدخول الفاشلة الحد
        المسموح خلال آخر 15 دقيقة.
    """
    check_not_locked_out(payload.identifier)

    user = (
        db.query(User)
        .filter(or_(User.email == payload.identifier, User.phone == payload.identifier))
        .first()
    )
    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        record_failed_attempt(payload.identifier)
        raise AppException("بيانات الدخول غير صحيحة", status_code=401)
    if not user.is_active:
        raise AppException("هذا الحساب موقوف، يرجى التواصل مع الإدارة", status_code=403)

    reset_attempts(payload.identifier)
    token = create_access_token({"sub": str(user.id), "role": user.role.value, "tv": user.token_version})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        full_name=user.full_name,
    )


def authenticate_with_google(db: Session, payload: GoogleLoginRequest) -> TokenResponse:
    """
    يتحقق من صحة Google ID Token ويُصدر توكن JWT للمنصة: يربط التوكن
    بحساب موجود بنفس البريد إن وُجد، أو ينشئ حساب عميل (customer) جديداً
    عند أول دخول.

    Args:
        db: جلسة قاعدة البيانات.
        payload: توكن الهوية الصادر من Google Identity Services في المتصفح.

    Returns:
        TokenResponse: التوكن الموقّع مع دور المستخدم واسمه.

    Raises:
        AppException: 503 إذا لم يُضبَط GOOGLE_CLIENT_ID بعد على الخادم،
        401 إذا كان التوكن غير صالح أو منتهي الصلاحية، أو 403 إذا كان
        الحساب المرتبط موقوفاً.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise AppException("تسجيل الدخول عبر قوقل غير مُفعَّل بعد على هذا الخادم", status_code=503)

    try:
        claims = google_id_token.verify_oauth2_token(
            payload.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
    except ValueError:
        raise AppException("توكن قوقل غير صالح أو منتهي الصلاحية", status_code=401)

    google_id = claims["sub"]
    email = claims.get("email")
    full_name = claims.get("name") or email or "مستخدم قوقل"

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.google_id = google_id

    if not user:
        user = User(full_name=full_name, email=email, google_id=google_id, role=UserRole.customer)
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise AppException("هذا الحساب موقوف، يرجى التواصل مع الإدارة", status_code=403)

    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role.value, "tv": user.token_version})
    return TokenResponse(access_token=token, token_type="bearer", role=user.role, full_name=user.full_name)
