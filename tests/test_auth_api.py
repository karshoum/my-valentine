# File: tests/test_auth_api.py

"""اختبارات مسار المصادقة (تسجيل عميل جديد، تسجيل الدخول، وحماية Endpoint محمي)."""


def test_register_customer_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "عميل جديد",
            "email": "new-customer@paradise.example",
            "phone": "0911111111",
            "password": "StrongPass@123",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["role"] == "customer"
    assert body["phone"] == "0911111111"


def test_register_duplicate_phone_fails(client):
    payload = {
        "full_name": "عميل جديد",
        "email": "unique1@paradise.example",
        "phone": "0922222222",
        "password": "StrongPass@123",
    }
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    payload["email"] = "unique2@paradise.example"
    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_login_success_and_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "مستخدم تسجيل الدخول",
            "email": "login-user@paradise.example",
            "phone": "0933333333",
            "password": "CorrectPass@123",
        },
    )

    good_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login-user@paradise.example", "password": "CorrectPass@123"},
    )
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()

    bad_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login-user@paradise.example", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401


def test_repeated_failed_logins_get_locked_out(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "مستخدم محاولات متكررة",
            "email": "lockout-user@paradise.example",
            "phone": "0944444444",
            "password": "CorrectPass@123",
        },
    )

    for _ in range(5):
        response = client.post(
            "/api/v1/auth/login",
            json={"identifier": "lockout-user@paradise.example", "password": "WrongPassword"},
        )
        assert response.status_code == 401

    locked_response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "lockout-user@paradise.example", "password": "CorrectPass@123"},
    )
    assert locked_response.status_code == 429


def test_password_change_invalidates_old_token_and_issues_new_one(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "مستخدم تغيير كلمة المرور",
            "email": "password-change-user@paradise.example",
            "phone": "0955555555",
            "password": "OldPass@123",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "password-change-user@paradise.example", "password": "OldPass@123"},
    )
    old_token = login_response.json()["access_token"]

    change_response = client.patch(
        "/api/v1/users/me/password",
        json={"current_password": "OldPass@123", "new_password": "NewPass@456"},
        headers={"Authorization": f"Bearer {old_token}"},
    )
    assert change_response.status_code == 200
    new_token = change_response.json()["access_token"]
    assert new_token != old_token

    old_token_response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {old_token}"})
    assert old_token_response.status_code == 401

    new_token_response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {new_token}"})
    assert new_token_response.status_code == 200
