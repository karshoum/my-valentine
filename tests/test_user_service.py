# File: tests/test_user_service.py

"""اختبارات خدمة المستخدمين: تغيير كلمة المرور الذاتي مع التحقق من القديمة."""

import pytest

from app.core.exceptions import AppException
from app.core.security import verify_password
from app.services import user_service


def test_change_password_success(db_session, customer_user):
    updated = user_service.change_password(db_session, customer_user, "Customer@12345", "NewStrong@678")

    assert verify_password("NewStrong@678", updated.password_hash)
    assert not verify_password("Customer@12345", updated.password_hash)


def test_change_password_wrong_current_raises(db_session, customer_user):
    with pytest.raises(AppException) as exc_info:
        user_service.change_password(db_session, customer_user, "WrongOld@123", "NewStrong@678")
    assert exc_info.value.status_code == 400


def test_change_password_same_as_current_raises(db_session, customer_user):
    with pytest.raises(AppException) as exc_info:
        user_service.change_password(db_session, customer_user, "Customer@12345", "Customer@12345")
    assert exc_info.value.status_code == 400
