# File: tests/test_order_deliverable_service.py

"""اختبارات رفع المستند النهائي (تذكرة/فيزا) وربطه بطلب."""

import io
from decimal import Decimal

import pytest
from fastapi import UploadFile

from app.core.exceptions import AppException
from app.models.enums import OrderStatus
from app.models.order import Order
from app.services import order_deliverable_service


def _make_order(db_session, user_id, service_id, status=OrderStatus.pending):
    order = Order(
        order_number=f"WB-TEST-DELIVERABLE-{user_id}",
        user_id=user_id,
        service_id=service_id,
        total_amount=Decimal("300"),
        currency_code="USD",
        status=status,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def _fake_upload(filename="ticket.pdf", content_type="application/pdf") -> UploadFile:
    return UploadFile(filename=filename, file=io.BytesIO(b"%PDF-1.4 fake ticket content"), headers={"content-type": content_type})


def test_attach_deliverable_rejects_order_still_pending(db_session, sample_service, customer_user, employee_user):
    order = _make_order(db_session, customer_user.id, sample_service.id, status=OrderStatus.pending)

    with pytest.raises(AppException) as exc_info:
        order_deliverable_service.attach_deliverable_file(db_session, order.id, _fake_upload(), employee_user)
    assert exc_info.value.status_code == 400


def test_attach_deliverable_succeeds_when_in_system(db_session, sample_service, customer_user, employee_user):
    order = _make_order(db_session, customer_user.id, sample_service.id, status=OrderStatus.in_system)

    updated = order_deliverable_service.attach_deliverable_file(db_session, order.id, _fake_upload(), employee_user)

    assert updated.deliverable_file_url is not None
    assert updated.deliverable_file_url.startswith("order_deliverables/")
    assert updated.deliverable_signed_url is not None
    assert "/api/v1/files/order_deliverables/" in updated.deliverable_signed_url


def test_attach_deliverable_succeeds_when_completed(db_session, sample_service, customer_user, employee_user):
    order = _make_order(db_session, customer_user.id, sample_service.id, status=OrderStatus.completed)

    updated = order_deliverable_service.attach_deliverable_file(db_session, order.id, _fake_upload(), employee_user)

    assert updated.deliverable_file_url is not None


def test_order_without_deliverable_has_no_signed_url(db_session, sample_service, customer_user):
    order = _make_order(db_session, customer_user.id, sample_service.id, status=OrderStatus.in_system)
    assert order.deliverable_signed_url is None
