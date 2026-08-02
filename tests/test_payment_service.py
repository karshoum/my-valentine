# File: tests/test_payment_service.py

"""اختبارات رفع الدفع، المراجعة اليدوية، وحقول العرض المحسوبة (رابط الإيصال ورقم الطلب)."""

import io
import uuid
from decimal import Decimal

import pytest
from fastapi import UploadFile

from app.core.exceptions import AppException
from app.models.enums import OrderStatus, PaymentMethod, PaymentStatus
from app.models.order import Order
from app.schemas.payment import PaymentSubmitRequest
from app.services import payment_service


def _make_order(db_session, user_id, service_id):
    order = Order(
        order_number=f"WB-TEST-PAYMENT-{uuid.uuid4().hex[:8]}",
        user_id=user_id,
        service_id=service_id,
        total_amount=Decimal("300"),
        currency_code="USD",
        status=OrderStatus.pending,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def _fake_receipt() -> UploadFile:
    return UploadFile(filename="receipt.jpg", file=io.BytesIO(b"fake jpeg bytes"), headers={"content-type": "image/jpeg"})


def test_submit_bankak_payment_without_receipt_raises(db_session, usd_currency, sample_service, customer_user):
    order = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("300"))

    with pytest.raises(AppException) as exc_info:
        payment_service.submit_payment(db_session, order.id, customer_user, payload, None)
    assert exc_info.value.status_code == 400


def test_submit_bankak_payment_with_receipt_succeeds(db_session, usd_currency, sample_service, customer_user):
    order = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("300"))

    payment = payment_service.submit_payment(db_session, order.id, customer_user, payload, _fake_receipt())

    assert payment.status == PaymentStatus.pending
    assert payment.receipt_image_url is not None
    assert payment.receipt_signed_url is not None
    assert payment.order_number == order.order_number


def test_verify_payment_approve_moves_order_to_processing(
    db_session, usd_currency, sample_service, customer_user, employee_user
):
    order = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("300"))
    payment = payment_service.submit_payment(db_session, order.id, customer_user, payload, _fake_receipt())

    payment_service.verify_payment(db_session, payment.id, True, "تم التأكيد", employee_user)
    db_session.refresh(order)

    assert order.status == OrderStatus.processing


def test_verify_payment_rejects_approval_when_amount_mismatches_order_total(
    db_session, usd_currency, sample_service, customer_user, employee_user
):
    order = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("250"))
    payment = payment_service.submit_payment(db_session, order.id, customer_user, payload, _fake_receipt())

    with pytest.raises(AppException) as exc_info:
        payment_service.verify_payment(db_session, payment.id, True, None, employee_user)
    assert exc_info.value.status_code == 400

    db_session.refresh(order)
    db_session.refresh(payment)
    assert order.status == OrderStatus.pending
    assert payment.status == PaymentStatus.pending


def test_verify_payment_allows_rejection_despite_amount_mismatch(
    db_session, usd_currency, sample_service, customer_user, employee_user
):
    order = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("250"))
    payment = payment_service.submit_payment(db_session, order.id, customer_user, payload, _fake_receipt())

    payment_service.verify_payment(db_session, payment.id, False, "المبلغ غير مطابق", employee_user)

    assert payment.status == PaymentStatus.rejected


def test_list_payments_filters_by_status(db_session, usd_currency, sample_service, customer_user, employee_user):
    order_one = _make_order(db_session, customer_user.id, sample_service.id)
    order_two = _make_order(db_session, customer_user.id, sample_service.id)
    payload = PaymentSubmitRequest(payment_method=PaymentMethod.bankak, amount=Decimal("300"))

    payment_service.submit_payment(db_session, order_one.id, customer_user, payload, _fake_receipt())
    second_payment = payment_service.submit_payment(db_session, order_two.id, customer_user, payload, _fake_receipt())
    payment_service.verify_payment(db_session, second_payment.id, True, None, employee_user)

    pending_only = payment_service.list_payments(db_session, PaymentStatus.pending)
    assert len(pending_only) == 1
    assert pending_only[0].order_id == order_one.id

    all_payments = payment_service.list_payments(db_session)
    assert len(all_payments) == 2
