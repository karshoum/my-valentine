# File: tests/test_service_service.py

"""اختبارات حذف الخدمة (مع حماية سجل الطلبات) وعروض الخصم المحدودة المدة."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.models.enums import OrderStatus
from app.models.order import Order
from app.schemas.service import ServiceDiscountUpdateRequest
from app.services import service_service


def test_delete_service_without_orders_succeeds(db_session, sample_service, admin_user):
    service_id = sample_service.id

    service_service.delete_service(db_session, service_id, admin_user)

    assert service_service.get_service_or_404 is not None
    with pytest.raises(AppException) as exc_info:
        service_service.get_service_or_404(db_session, service_id)
    assert exc_info.value.status_code == 404


def test_delete_service_with_prior_orders_is_blocked(db_session, sample_service, customer_user, admin_user):
    order = Order(
        order_number="WB-TEST-DELETE-1",
        user_id=customer_user.id,
        service_id=sample_service.id,
        total_amount=Decimal("300"),
        currency_code="USD",
        status=OrderStatus.pending,
    )
    db_session.add(order)
    db_session.commit()

    with pytest.raises(AppException) as exc_info:
        service_service.delete_service(db_session, sample_service.id, admin_user)
    assert exc_info.value.status_code == 409
    assert service_service.get_service_or_404(db_session, sample_service.id) is not None


def test_set_service_discount_activates_and_reduces_effective_price(db_session, sample_service, admin_user):
    payload = ServiceDiscountUpdateRequest(
        discount_percentage=Decimal("20"),
        discount_valid_until=datetime.now(timezone.utc) + timedelta(days=7),
    )

    updated = service_service.set_service_discount(db_session, sample_service.id, payload, admin_user)

    assert updated.has_active_discount is True
    assert updated.effective_price_usd == Decimal("240.00")  # 300 * 0.8


def test_expired_discount_is_not_active(db_session, sample_service, admin_user):
    payload = ServiceDiscountUpdateRequest(
        discount_percentage=Decimal("50"),
        discount_valid_until=datetime.now(timezone.utc) + timedelta(days=1),
    )
    updated = service_service.set_service_discount(db_session, sample_service.id, payload, admin_user)

    # نحاكي انتهاء العرض بتعديل تاريخه مباشرة إلى الماضي
    updated.discount_valid_until = datetime.now(timezone.utc) - timedelta(days=1)
    db_session.commit()

    assert updated.has_active_discount is False
    assert updated.effective_price_usd == updated.base_price_usd


def test_clearing_discount_sets_both_fields_to_none(db_session, sample_service, admin_user):
    service_service.set_service_discount(
        db_session,
        sample_service.id,
        ServiceDiscountUpdateRequest(discount_percentage=Decimal("10"), discount_valid_until=datetime.now(timezone.utc) + timedelta(days=1)),
        admin_user,
    )

    cleared = service_service.set_service_discount(
        db_session, sample_service.id, ServiceDiscountUpdateRequest(), admin_user
    )

    assert cleared.discount_percentage is None
    assert cleared.discount_valid_until is None
    assert cleared.has_active_discount is False


def test_discount_request_rejects_percentage_without_expiry():
    with pytest.raises(ValueError):
        ServiceDiscountUpdateRequest(discount_percentage=Decimal("10"))
