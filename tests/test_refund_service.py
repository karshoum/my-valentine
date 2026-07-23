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
