# File: app/services/user_service.py

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import StaffCreateRequest
from app.services import audit_service


def create_staff_user(db: Session, payload: StaffCreateRequest, created_by: User) -> User:
    """
    ينشئ حساب موظف أو مدير جديد (بصلاحية admin فقط)، ويسجّل الحركة في
    سجل التدقيق.

    Args:
        db: جلسة قاعدة البيانات.
        payload: بيانات الحساب الجديد ودوره (admin أو employee).
        created_by: المدير الذي ينفّذ عملية الإنشاء.

    Returns:
        User: حساب الموظف/المدير المُنشَأ حديثاً.

    Raises:
        AppException: 400 إذا كان الدور غير مسموح، أو 409 إذا كان
        البريد/الهاتف مسجلاً مسبقاً.
    """
    if payload.role not in (UserRole.admin, UserRole.employee):
        raise AppException("لا يمكن إنشاء مستخدم بهذا الدور من هذه الشاشة", status_code=400)

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
        role=payload.role,
    )
    db.add(user)
    audit_service.log_action(
        db,
        user_id=created_by.id,
        action="create_staff_user",
        details={"created_role": payload.role.value, "phone": payload.phone},
    )
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, role: UserRole | None = None) -> list[User]:
    """
    يُعيد كل المستخدمين، مع إمكانية التصفية حسب الدور.

    Args:
        db: جلسة قاعدة البيانات.
        role: دور اختياري للتصفية به.

    Returns:
        list[User]: قائمة المستخدمين مرتبة تنازلياً حسب تاريخ الإنشاء.
    """
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


def get_user_or_404(db: Session, user_id: int) -> User:
    """
    يجلب مستخدماً بمعرّفه أو يرفع استثناءً إذا لم يوجد.

    Args:
        db: جلسة قاعدة البيانات.
        user_id: معرّف المستخدم المطلوب.

    Returns:
        User: المستخدم المطابق.

    Raises:
        AppException: 404 إذا لم يوجد مستخدم بهذا المعرّف.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppException("المستخدم غير موجود", status_code=404)
    return user


def set_user_active_status(db: Session, user_id: int, is_active: bool, changed_by: User) -> User:
    """
    يُفعّل أو يوقف حساب مستخدم، مع منع المدير من تعديل حالة حسابه الخاص.

    Args:
        db: جلسة قاعدة البيانات.
        user_id: معرّف المستخدم المستهدَف.
        is_active: الحالة الجديدة المطلوبة.
        changed_by: المدير الذي ينفّذ التعديل.

    Returns:
        User: المستخدم بعد تحديث حالته.

    Raises:
        AppException: 400 إذا حاول المدير تعديل حسابه الخاص، أو 404 إذا
        لم يوجد المستخدم المستهدَف.
    """
    user = get_user_or_404(db, user_id)
    if user.id == changed_by.id:
        raise AppException("لا يمكنك تغيير حالة حسابك الخاص", status_code=400)

    user.is_active = is_active
    audit_service.log_action(
        db,
        user_id=changed_by.id,
        action="update_user_status",
        details={"target_user_id": user.id, "is_active": is_active},
    )
    db.commit()
    db.refresh(user)
    return user


def change_password(db: Session, user: User, current_password: str, new_password: str) -> User:
    """
    يغيّر كلمة مرور المستخدم الحالي بعد التحقق من كلمة المرور القديمة.

    Args:
        db: جلسة قاعدة البيانات.
        user: المستخدم الحالي (صاحب الطلب).
        current_password: كلمة المرور الحالية للتحقق منها.
        new_password: كلمة المرور الجديدة المطلوبة.

    Returns:
        User: المستخدم بعد تحديث كلمة مروره.

    Raises:
        AppException: 400 إذا كانت كلمة المرور الحالية خاطئة، أو إذا
        كانت كلمة المرور الجديدة مطابقة للقديمة.
    """
    if not verify_password(current_password, user.password_hash):
        raise AppException("كلمة المرور الحالية غير صحيحة", status_code=400)

    if verify_password(new_password, user.password_hash):
        raise AppException("كلمة المرور الجديدة يجب أن تختلف عن الحالية", status_code=400)

    user.password_hash = hash_password(new_password)
    audit_service.log_action(
        db,
        user_id=user.id,
        action="change_own_password",
        details={"user_id": user.id},
    )
    db.commit()
    db.refresh(user)
    return user
