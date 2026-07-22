from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.models.enums import OrderStatus, PaymentMode, WalletTransactionType
from app.models.order import Order
from app.services import wallet_service
from tests.conftest import make_agent


def _make_order(db_session, user_id, service_id, amount, currency_code="USD"):
    order = Order(
        order_number=f"WB-TEST-{user_id}-{amount}",
        user_id=user_id,
        service_id=service_id,
        total_amount=amount,
        currency_code=currency_code,
        status=OrderStatus.pending,
    )
    db_session.add(order)
    db_session.commit()
    db_session.refresh(order)
    return order


def test_prepaid_wallet_insufficient_balance_raises(db_session, usd_currency, sample_service):
    user, agent = make_agent(db_session, PaymentMode.prepaid_wallet, wallet_balance=Decimal("50"))
    order = _make_order(db_session, user.id, sample_service.id, Decimal("300"))

    with pytest.raises(AppException) as exc_info:
        wallet_service.deduct_for_order(db_session, agent, order)
    assert exc_info.value.status_code == 400
    assert agent.wallet_balance == Decimal("50")


def test_prepaid_wallet_sufficient_balance_deducts_and_logs(db_session, usd_currency, sample_service):
    user, agent = make_agent(db_session, PaymentMode.prepaid_wallet, wallet_balance=Decimal("500"))
    order = _make_order(db_session, user.id, sample_service.id, Decimal("300"))

    log = wallet_service.deduct_for_order(db_session, agent, order)
    db_session.commit()

    assert agent.wallet_balance == Decimal("200")
    assert log.transaction_type == WalletTransactionType.deduction
    assert log.order_id == order.id


def test_credit_limit_allows_going_negative_within_limit(db_session, usd_currency, sample_service):
    user, agent = make_agent(
        db_session, PaymentMode.credit_limit, credit_limit=Decimal("1000"), wallet_balance=Decimal("0")
    )
    order = _make_order(db_session, user.id, sample_service.id, Decimal("300"))

    wallet_service.deduct_for_order(db_session, agent, order)
    db_session.commit()

    assert agent.wallet_balance == Decimal("-300")


def test_credit_limit_exceeded_raises(db_session, usd_currency, sample_service):
    user, agent = make_agent(
        db_session, PaymentMode.credit_limit, credit_limit=Decimal("100"), wallet_balance=Decimal("0")
    )
    order = _make_order(db_session, user.id, sample_service.id, Decimal("300"))

    with pytest.raises(AppException) as exc_info:
        wallet_service.deduct_for_order(db_session, agent, order)
    assert exc_info.value.status_code == 400
    assert agent.wallet_balance == Decimal("0")


def test_pay_per_order_forbids_wallet_deduction(db_session, usd_currency, sample_service):
    user, agent = make_agent(db_session, PaymentMode.pay_per_order)
    order = _make_order(db_session, user.id, sample_service.id, Decimal("300"))

    with pytest.raises(AppException) as exc_info:
        wallet_service.deduct_for_order(db_session, agent, order)
    assert exc_info.value.status_code == 400
