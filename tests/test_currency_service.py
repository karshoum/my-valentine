# File: tests/test_currency_service.py

"""اختبارات منطق العملات: التحويل، والتحديث اليدوي الحصري لسعر الصرف."""

from decimal import Decimal

import pytest

from app.core.exceptions import AppException
from app.services import currency_service


def test_convert_usd_to_sdg(db_session, sdg_currency):
    result = currency_service.convert_usd_to(db_session, Decimal("10"), "sdg")
    assert result == Decimal("6000.00")


def test_get_missing_currency_raises(db_session):
    with pytest.raises(AppException) as exc_info:
        currency_service.get_currency_or_404(db_session, "XXX")
    assert exc_info.value.status_code == 404


def test_manual_rate_update_forces_is_manual_true(db_session, sdg_currency, admin_user):
    updated = currency_service.update_currency_rate(db_session, "SDG", Decimal("650"), admin_user)
    assert updated.is_manual is True
    assert updated.rate_to_usd == Decimal("650.0000")
    assert updated.updated_by == admin_user.id


def test_manual_rate_update_writes_audit_log(db_session, sdg_currency, admin_user):
    from app.models.audit import AuditLog

    currency_service.update_currency_rate(db_session, "SDG", Decimal("700"), admin_user)

    logs = db_session.query(AuditLog).filter(AuditLog.action == "update_currency_rate").all()
    assert len(logs) == 1
    assert logs[0].user_id == admin_user.id
    assert logs[0].details["code"] == "SDG"
