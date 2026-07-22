"""
منطق العملات وسعر الجنيه السوداني (SDG Currency Logic).

يُمنع تماماً الربط الآلي بأي مزوّد أسعار صرف خارجي (لا يوجد في هذا
المشروع أي job أو استدعاء API خارجي لتحديث الأسعار). كل عملة تحمل حقل
is_manual، وتحديث سعرها (rate_to_usd) لا يتم إلا يدوياً ومن قبل المدير
(admin) عبر الدالة update_currency_rate أدناه فقط.
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.currency import Currency
from app.models.user import User
from app.schemas.currency import CurrencyCreateRequest
from app.services import audit_service


def list_currencies(db: Session) -> list[Currency]:
    return db.query(Currency).order_by(Currency.code).all()


def get_currency_or_404(db: Session, code: str) -> Currency:
    currency = db.query(Currency).filter(Currency.code == code.upper()).first()
    if not currency:
        raise AppException("العملة غير موجودة", status_code=404)
    return currency


def create_currency(db: Session, payload: CurrencyCreateRequest, admin_user: User) -> Currency:
    code = payload.code.upper()
    if db.query(Currency).filter(Currency.code == code).first():
        raise AppException("هذه العملة مضافة مسبقاً", status_code=409)

    currency = Currency(
        code=code,
        name=payload.name,
        rate_to_usd=payload.rate_to_usd,
        is_manual=True,
        updated_by=admin_user.id,
    )
    db.add(currency)
    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="create_currency",
        details={"code": code, "rate_to_usd": str(payload.rate_to_usd)},
    )
    db.commit()
    db.refresh(currency)
    return currency


def update_currency_rate(db: Session, code: str, new_rate: Decimal, admin_user: User) -> Currency:
    """
    التحديث اليدوي الحصري لسعر الصرف. يجب أن يمر أي تعديل لسعر الجنيه
    السوداني (أو أي عملة أخرى) من هذه الدالة وحدها، ولا تُستدعى إلا من
    Endpoint مقيّد بصلاحية admin فقط.
    """
    currency = get_currency_or_404(db, code)
    old_rate = currency.rate_to_usd

    currency.rate_to_usd = new_rate
    currency.is_manual = True
    currency.updated_by = admin_user.id

    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="update_currency_rate",
        details={"code": currency.code, "old_rate": str(old_rate), "new_rate": str(new_rate)},
    )
    db.commit()
    db.refresh(currency)
    return currency


def convert_usd_to(db: Session, amount_usd: Decimal, target_currency_code: str) -> Decimal:
    currency = get_currency_or_404(db, target_currency_code)
    return (amount_usd * currency.rate_to_usd).quantize(Decimal("0.01"))
