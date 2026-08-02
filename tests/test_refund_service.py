# File: tests/test_refund_service.py

"""اختبارات منطق طلبات الاسترداد: سقف المبلغ، ودورة الاعتماد والتنفيذ."""

from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.models.enums import OrderStatus, PaymentMode, RefundStatus
from app.schemas.order import OrderCreateRequest, OrderPassengerIn
from app.schemas.refund import RefundCreateRequest
from app.services import order_service, refund_service
from tests.conftest import make_agent


def _make_processing_order(db_session, user, sample_service):
    payload = OrderCreateRequest(
        service_id=sample_service.id,
        currency_code="USD",
        contact_whatsapp="0911112222",
        passengers=[OrderPassengerIn(full_name="فاطمة علي")],
    )
    order = order_service.create_order(db_session, user, payload)
    return order_service.update_order_status(db_session, order.id, OrderStatus.processing, user, None)


def test_refund_amount_exceeding_order_total_raises(db_session, usd_currency, customer_user, sample_service):
    order = _make_processing_order(db_session, customer_user, sample_service)

    with pytest.raises(AppException) as exc_info:
        refund_service.create_refund_request(
            db_session, order.id, customer_user, RefundCreateRequest(refund_amount=Decimal("9999"))
        )
    assert exc_info.value.status_code == 400


def test_duplicate_pending_refund_request_raises(db_session, usd_currency, customer_user, sample_service):
    order = _make_processing_order(db_session, customer_user, sample_service)
    refund_service.create_refund_request(
        db_session, order.id, customer_user, RefundCreateRequest(refund_amount=Decimal("100"))
    )

    with pytest.raises(AppException) as exc_info:
        refund_service.create_refund_request(
            db_session, order.id, customer_user, RefundCreateRequest(refund_amount=Decimal("50"))
        )
    assert exc_info.value.status_code == 409


def test_process_refund_logs_order_status_change(db_session, usd_currency, admin_user, sample_service):
    user, agent = make_agent(db_session, PaymentMode.prepaid_wallet, wallet_balance=Decimal("1000"))
    order = _make_processing_order(db_session, user, sample_service)
    logs_before = len(order.status_logs)

    refund = refund_service.create_refund_request(
        db_session, order.id, user, RefundCreateRequest(refund_amount=order.total_amount)
    )
    refund_service.approve_refund(db_session, refund.id, admin_user)
    processed = refund_service.process_refund(db_session, refund.id, admin_user)

    assert processed.status == RefundStatus.processed
    db_session.refresh(order)
    assert order.status == OrderStatus.refunded
    assert len(order.status_logs) == logs_before + 1
    assert order.status_logs[-1].new_status == OrderStatus.refunded
    assert order.status_logs[-1].changed_by == admin_user.id


def test_refund_out_exposes_order_number(db_session, usd_currency, customer_user, sample_service):
    order = _make_processing_order(db_session, customer_user, sample_service)
    refund = refund_service.create_refund_request(
        db_session, order.id, customer_user, RefundCreateRequest(refund_amount=Decimal("100"))
    )
    assert refund.order_number == order.order_number


def test_list_refunds_filters_by_status(db_session, usd_currency, customer_user, admin_user, sample_service):
    order_one = _make_processing_order(db_session, customer_user, sample_service)
    order_two = _make_processing_order(db_session, customer_user, sample_service)

    refund_one = refund_service.create_refund_request(
        db_session, order_one.id, customer_user, RefundCreateRequest(refund_amount=Decimal("100"))
    )
    refund_two = refund_service.create_refund_request(
        db_session, order_two.id, customer_user, RefundCreateRequest(refund_amount=Decimal("50"))
    )
    refund_service.decline_refund(db_session, refund_two.id, admin_user, "غير مستحق")

    pending_only = refund_service.list_refunds(db_session, RefundStatus.pending)
    assert len(pending_only) == 1
    assert pending_only[0].id == refund_one.id

    all_refunds = refund_service.list_refunds(db_session)
    assert len(all_refunds) == 2
