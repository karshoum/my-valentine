# File: tests/test_google_login.py

"""اختبارات تسجيل الدخول عبر قوقل: عدم التفعيل، إنشاء حساب جديد، وربط حساب موجود بنفس البريد."""

import pytest

from app.core.exceptions import AppException
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import GoogleLoginRequest
from app.services import auth_service


def _fake_claims(sub: str, email: str, name: str):
    return {"sub": sub, "email": email, "name": name}


def test_google_login_disabled_without_client_id(db_session, monkeypatch):
    monkeypatch.setattr(auth_service.settings, "GOOGLE_CLIENT_ID", None)

    with pytest.raises(AppException) as exc_info:
        auth_service.authenticate_with_google(db_session, GoogleLoginRequest(id_token="whatever-token"))
    assert exc_info.value.status_code == 503


def test_google_login_rejects_invalid_token(db_session, monkeypatch):
    monkeypatch.setattr(auth_service.settings, "GOOGLE_CLIENT_ID", "test-client-id")

    def _raise_invalid(*args, **kwargs):
        raise ValueError("Token used too early")

    monkeypatch.setattr(auth_service.google_id_token, "verify_oauth2_token", _raise_invalid)

    with pytest.raises(AppException) as exc_info:
        auth_service.authenticate_with_google(db_session, GoogleLoginRequest(id_token="bad-token-value"))
    assert exc_info.value.status_code == 401


def test_google_login_creates_new_customer_on_first_login(db_session, monkeypatch):
    monkeypatch.setattr(auth_service.settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        auth_service.google_id_token,
        "verify_oauth2_token",
        lambda *a, **k: _fake_claims("google-sub-1", "new-google-user@baradis.example", "مستخدم قوقل جديد"),
    )

    response = auth_service.authenticate_with_google(db_session, GoogleLoginRequest(id_token="valid-token"))

    assert response.role == UserRole.customer
    created = db_session.query(User).filter(User.google_id == "google-sub-1").first()
    assert created is not None
    assert created.email == "new-google-user@baradis.example"
    assert created.password_hash is None
    assert created.phone is None


def test_google_login_links_existing_account_by_email(db_session, customer_user, monkeypatch):
    monkeypatch.setattr(auth_service.settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        auth_service.google_id_token,
        "verify_oauth2_token",
        lambda *a, **k: _fake_claims("google-sub-2", customer_user.email, customer_user.full_name),
    )

    auth_service.authenticate_with_google(db_session, GoogleLoginRequest(id_token="valid-token"))

    db_session.refresh(customer_user)
    assert customer_user.google_id == "google-sub-2"
    assert db_session.query(User).filter(User.email == customer_user.email).count() == 1


def test_google_login_blocks_inactive_linked_account(db_session, customer_user, monkeypatch):
    customer_user.is_active = False
    db_session.commit()

    monkeypatch.setattr(auth_service.settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        auth_service.google_id_token,
        "verify_oauth2_token",
        lambda *a, **k: _fake_claims("google-sub-3", customer_user.email, customer_user.full_name),
    )

    with pytest.raises(AppException) as exc_info:
        auth_service.authenticate_with_google(db_session, GoogleLoginRequest(id_token="valid-token"))
    assert exc_info.value.status_code == 403
