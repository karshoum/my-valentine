# File: tests/test_email_service.py

"""اختبارات خدمة إرسال إشعارات الإيميل: التجاوز الصامت بلا إعدادات، الإرسال الفعلي، وتحمّل فشل SMTP."""

from decimal import Decimal

import pytest

from app.models.enums import OrderStatus
from app.models.order import Order
from app.services import email_service


@pytest.fixture()
def sample_order(db_session, customer_user, sample_service):
    order = Order(
        order_number="WB-TEST-EMAIL-1",
        user_id=customer_user.id,
        service_id=sample_service.id,
        total_amount=Decimal("300"),
        currency_code="USD",
        status=OrderStatus.pending,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def test_send_email_is_skipped_silently_without_smtp_host(monkeypatch, sample_order):
    monkeypatch.setattr(email_service.settings, "SMTP_HOST", None)

    email_service.send_order_confirmation_email(sample_order)  # لا يجب أن يرفع أي استثناء


def test_send_order_confirmation_email_sends_via_smtp(monkeypatch, sample_order):
    sent_messages = []

    class FakeSMTP:
        def __init__(self, host, port, timeout=10):
            sent_messages.append({"host": host, "port": port})

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def starttls(self):
            pass

        def login(self, username, password):
            sent_messages.append({"login": (username, password)})

        def send_message(self, message):
            sent_messages.append({"to": message["To"], "subject": message["Subject"]})

    monkeypatch.setattr(email_service.settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "SMTP_FROM_EMAIL", "no-reply@baradise.example")
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)

    email_service.send_order_confirmation_email(sample_order)

    sent_to_customer = [m for m in sent_messages if "to" in m]
    assert len(sent_to_customer) == 1
    assert sent_to_customer[0]["to"] == sample_order.customer.email
    assert sample_order.order_number in sent_to_customer[0]["subject"]


def test_send_order_status_update_email_uses_arabic_label(monkeypatch, sample_order):
    sent_messages = []

    class FakeSMTP:
        def __init__(self, host, port, timeout=10):
            pass

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return False

        def starttls(self):
            pass

        def send_message(self, message):
            sent_messages.append(message.get_content())

    monkeypatch.setattr(email_service.settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "SMTP_FROM_EMAIL", "no-reply@baradise.example")
    monkeypatch.setattr(email_service.settings, "SMTP_USERNAME", None)
    monkeypatch.setattr(email_service.smtplib, "SMTP", FakeSMTP)

    sample_order.status = OrderStatus.processing
    email_service.send_order_status_update_email(sample_order)

    assert "تم تأكيد الدفع" in sent_messages[0]


def test_smtp_connection_failure_does_not_raise(monkeypatch, sample_order):
    class FailingSMTP:
        def __init__(self, host, port, timeout=10):
            raise OSError("connection refused")

    monkeypatch.setattr(email_service.settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "SMTP_FROM_EMAIL", "no-reply@baradise.example")
    monkeypatch.setattr(email_service.smtplib, "SMTP", FailingSMTP)

    email_service.send_order_confirmation_email(sample_order)  # لا يجب أن يرفع أي استثناء


def test_order_without_customer_email_is_skipped(monkeypatch, db_session, sample_service):
    from app.models.enums import UserRole
    from app.models.user import User

    customer_without_email = User(full_name="عميل بلا بريد", phone="0900000099", google_id="g-1", role=UserRole.customer)
    db_session.add(customer_without_email)
    db_session.commit()
    db_session.refresh(customer_without_email)

    order = Order(
        order_number="WB-TEST-EMAIL-2",
        user_id=customer_without_email.id,
        service_id=sample_service.id,
        total_amount=Decimal("100"),
        currency_code="USD",
        status=OrderStatus.pending,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)

    monkeypatch.setattr(email_service.settings, "SMTP_HOST", "smtp.example.com")
    monkeypatch.setattr(email_service.settings, "SMTP_FROM_EMAIL", "no-reply@baradise.example")

    def _fail_if_called(*args, **kwargs):
        raise AssertionError("لا يجب محاولة الإرسال بلا بريد إلكتروني للعميل")

    monkeypatch.setattr(email_service.smtplib, "SMTP", _fail_if_called)

    email_service.send_order_confirmation_email(order)
