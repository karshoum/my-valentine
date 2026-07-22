def test_register_customer_success(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "عميل جديد",
            "email": "new-customer@baradis.example",
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
        "email": "unique1@baradis.example",
        "phone": "0922222222",
        "password": "StrongPass@123",
    }
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    payload["email"] = "unique2@baradis.example"
    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_login_success_and_wrong_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "مستخدم تسجيل الدخول",
            "email": "login-user@baradis.example",
            "phone": "0933333333",
            "password": "CorrectPass@123",
        },
    )

    good_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login-user@baradis.example", "password": "CorrectPass@123"},
    )
    assert good_login.status_code == 200
    assert "access_token" in good_login.json()

    bad_login = client.post(
        "/api/v1/auth/login",
        json={"identifier": "login-user@baradis.example", "password": "WrongPassword"},
    )
    assert bad_login.status_code == 401


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/v1/users/me")
    assert response.status_code == 401
