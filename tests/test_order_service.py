# File: tests/test_order_service.py

"""اختبارات دورة حياة الطلب: الإنشاء، التسعير بالعملة المستهدفة، ومصفوفة انتقالات الحالة."""

from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.models.enums import OrderStatus
from app.schemas.order import OrderCreateRequest, OrderPassengerIn
from app.services import order_service


def test_create_order_computes_total_in_target_currency(db_session, usd_currency, sdg_currency, customer_user, sample_service):
    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="SDG",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="محمد أحمد", passport_number="P123456")],
    )

    order = order_service.create_order(db_session, customer_user, payload)

    assert order.status == OrderStatus.pending
    assert order.currency_code == "SDG"
    assert order.total_amount == Decimal("180000.00")  # 300 USD * 600
    assert len(order.passengers) == 1
    assert len(order.status_logs) == 1
    assert order.status_logs[0].new_status == OrderStatus.pending
    assert order.status_logs[0].changed_by == customer_user.id


def test_valid_status_transition_pending_to_processing(db_session, usd_currency, customer_user, employee_user, sample_service):
    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="فاطمة علي")],
    )
    order = order_service.create_order(db_session, customer_user, payload)

    updated = order_service.update_order_status(
        db_session, order.id, OrderStatus.processing, employee_user, "تم تأكيد الدفع"
    )

    assert updated.status == OrderStatus.processing
    assert len(updated.status_logs) == 2
    assert updated.status_logs[-1].old_status == OrderStatus.pending
    assert updated.status_logs[-1].new_status == OrderStatus.processing
    assert updated.status_logs[-1].changed_by == employee_user.id


def test_invalid_status_transition_raises(db_session, usd_currency, customer_user, employee_user, sample_service):
    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="فاطمة علي")],
    )
    order = order_service.create_order(db_session, customer_user, payload)

    with pytest.raises(AppException) as exc_info:
        order_service.update_order_status(db_session, order.id, OrderStatus.completed, employee_user, None)
    assert exc_info.value.status_code == 400


def test_customer_cannot_access_other_customer_order(db_session, usd_currency, customer_user, sample_service):
    from app.core.security import hash_password
    from app.models.enums import UserRole
    from app.models.user import User

    other_customer = User(
        full_name="عميل آخر",
        email="other@paradise.example",
        phone="0900000099",
        password_hash=hash_password("Other@12345"),
        role=UserRole.customer,
    )
    db_session.add(other_customer)
    db_session.commit()
    db_session.refresh(other_customer)

    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="فاطمة علي")],
    )
    order = order_service.create_order(db_session, customer_user, payload)

    with pytest.raises(AppException) as exc_info:
        order_service.get_order_with_access_check(db_session, order.id, other_customer)
    assert exc_info.value.status_code == 403
