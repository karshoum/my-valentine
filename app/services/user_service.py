# File: app/services/user_service.py

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import hash_password, verify_password
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import ProfileUpdateRequest, StaffPromoteRequest
from app.services import audit_service


def promote_user_to_staff(db: Session, payload: StaffPromoteRequest, promoted_by: User) -> User:
    """
    يرقّي حساب عميل عادي موجود مسبقاً إلى موظف أو مدير (admin فقط)، بدل
    إنشاء حساب جديد وإدخال بياناته يدوياً — الشخص يسجّل حسابه العادي
    بنفسه أولاً ثم يختاره المدير من قائمة العملاء للترقية.

    Args:
        db: جلسة قاعدة البيانات.
        payload: معرّف حساب العميل المُراد ترقيته والدور الجديد (admin أو employee).
        promoted_by: المدير الذي ينفّذ الترقية.

    Returns:
        User: الحساب بعد الترقية.

    Raises:
        AppException: 400 إذا كان الدور المطلوب غير مسموح أو كان الحساب
        ليس حساب عميل عادي أصلاً، أو 404 إذا لم يوجد المستخدم.
    """
    if payload.role not in (UserRole.admin, UserRole.employee):
        raise AppException("لا يمكن الترقية لهذا الدور من هذه الشاشة", status_code=400)

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise AppException("المستخدم غير موجود", status_code=404)
    if user.role != UserRole.customer:
        raise AppException("يمكن ترقية حسابات العملاء العاديين فقط", status_code=400)

    user.role = payload.role

    audit_service.log_action(
        db,
        user_id=promoted_by.id,
        action="promote_user_to_staff",
        details={"target_user_id": user.id, "new_role": payload.role.value},
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
        User: المستخدم بعد تحديث كلمة مروره (وزيادة token_version، ما
        يُبطل فوراً أي توكن JWT صادر قبل هذا التغيير).

    Raises:
        AppException: 400 إذا كانت كلمة المرور الحالية خاطئة، أو إذا
        كانت كلمة المرور الجديدة مطابقة للقديمة.
    """
    if not verify_password(current_password, user.password_hash):
        raise AppException("كلمة المرور الحالية غير صحيحة", status_code=400)

    if verify_password(new_password, user.password_hash):
        raise AppException("كلمة المرور الجديدة يجب أن تختلف عن الحالية", status_code=400)

    user.password_hash = hash_password(new_password)
    user.token_version += 1
    audit_service.log_action(
        db,
        user_id=user.id,
        action="change_own_password",
        details={"user_id": user.id},
    )
    db.commit()
    db.refresh(user)
    return user


def update_own_profile(db: Session, user: User, payload: ProfileUpdateRequest) -> User:
    """
    يحدّث بيانات ملف المستخدم الشخصي (الاسم/البريد/رقم واتساب) ذاتياً،
    مع التحقق من عدم تكرار البريد الجديد لدى حساب آخر. الحقول غير
    المُرسَلة في الطلب تبقى دون تغيير.

    Args:
        db: جلسة قاعدة البيانات.
        user: المستخدم الحالي (صاحب الطلب).
        payload: الحقول المطلوب تعديلها.

    Returns:
        User: المستخدم بعد التحديث.

    Raises:
        AppException: 409 إذا كان البريد الجديد مسجلاً مسبقاً لحساب آخر.
    """
    updates = payload.model_dump(exclude_unset=True)

    new_email = updates.get("email")
    if new_email and new_email != user.email:
        existing = db.query(User).filter(User.email == new_email, User.id != user.id).first()
        if existing:
            raise AppException("هذا البريد الإلكتروني مسجل مسبقاً لحساب آخر", status_code=409)

    for field, value in updates.items():
        setattr(user, field, value)

    audit_service.log_action(db, user_id=user.id, action="update_own_profile", details={"fields": list(updates)})
    db.commit()
    db.refresh(user)
    return user


def deactivate_own_account(db: Session, user: User, password: str) -> None:
    """
    يوقف حساب المستخدم الحالي ذاتياً بعد التحقق من كلمة المرور، ويُبطل
    فوراً كل جلساته (زيادة token_version). الحساب لا يُحذَف فعلياً من
    قاعدة البيانات حفاظاً على سلامة سجل الطلبات والمدفوعات المرتبطة به؛
    بل يُعطَّل فقط، فيُمنَع بذلك من تسجيل الدخول مجدداً.

    Args:
        db: جلسة قاعدة البيانات.
        user: المستخدم الحالي (صاحب الطلب).
        password: كلمة المرور الحالية للتأكيد.

    Raises:
        AppException: 400 إذا كانت كلمة المرور غير صحيحة، أو إذا كان
        الحساب حساب وكيل (agent) - له محفظة مالية يجب إغلاقها عبر الإدارة أولاً.
    """
    if not user.password_hash or not verify_password(password, user.password_hash):
        raise AppException("كلمة المرور غير صحيحة", status_code=400)

    if user.role == UserRole.agent:
        raise AppException("لا يمكن إيقاف حساب وكيل ذاتياً، يرجى التواصل مع الإدارة", status_code=400)

    user.is_active = False
    user.token_version += 1
    audit_service.log_action(db, user_id=user.id, action="deactivate_own_account", details={"user_id": user.id})
    db.commit()
