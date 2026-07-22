from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import StaffCreateRequest
from app.services import audit_service


def create_staff_user(db: Session, payload: StaffCreateRequest, created_by: User) -> User:
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
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


def get_user_or_404(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise AppException("المستخدم غير موجود", status_code=404)
    return user


def set_user_active_status(db: Session, user_id: int, is_active: bool, changed_by: User) -> User:
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
