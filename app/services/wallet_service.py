"""
نظام محفظة الوكلاء (B2B Agent Wallet).

- prepaid_wallet: الخصم يتم من الرصيد الموجب فقط، ولا يجوز أن يهبط الرصيد
  تحت الصفر.
- credit_limit: يسمح للرصيد بالنزول إلى قيمة سالبة حتى سقف credit_limit
  (أي: الرصيد لا يجوز أن يقل عن -credit_limit).
- pay_per_order: لا يُسمح بالخصم من المحفظة إطلاقاً؛ يجب أن يدفع الوكيل
  عبر بنكك/فيزا مثل أي عميل عادي وتخضع لنفس المراجعة اليدوية.

كل حركة (إيداع/خصم/استرداد) تُسجَّل إلزامياً في agent_wallet_logs.
"""

from decimal import Decimal

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.agent import AgentProfile
from app.models.enums import PaymentMode, WalletTransactionType
from app.models.order import Order
from app.models.user import User
from app.models.wallet import AgentWalletLog
from app.services import audit_service


def deposit(db: Session, agent: AgentProfile, amount: Decimal, admin_user: User, notes: str | None) -> AgentWalletLog:
    if amount <= 0:
        raise AppException("قيمة الإيداع يجب أن تكون أكبر من صفر", status_code=400)

    agent.wallet_balance = agent.wallet_balance + amount
    log = AgentWalletLog(
        agent_id=agent.id,
        transaction_type=WalletTransactionType.deposit,
        amount=amount,
        notes=notes,
    )
    db.add(log)
    audit_service.log_action(
        db,
        user_id=admin_user.id,
        action="agent_wallet_deposit",
        details={"agent_id": agent.id, "amount": str(amount)},
    )
    db.commit()
    db.refresh(log)
    return log


def deduct_for_order(db: Session, agent: AgentProfile, order: Order) -> AgentWalletLog:
    amount = order.total_amount

    if agent.payment_mode == PaymentMode.pay_per_order:
        raise AppException(
            "وضع الدفع الخاص بهذا الوكيل لا يسمح بالخصم من المحفظة، يجب الدفع عبر بنكك أو فيزا",
            status_code=400,
        )

    if agent.payment_mode == PaymentMode.prepaid_wallet:
        if agent.wallet_balance < amount:
            raise AppException("رصيد المحفظة غير كافٍ لإتمام هذا الطلب", status_code=400)

    elif agent.payment_mode == PaymentMode.credit_limit:
        projected_balance = agent.wallet_balance - amount
        if projected_balance < -agent.credit_limit:
            raise AppException("تجاوزت الحد الائتماني المسموح لحسابك", status_code=400)

    agent.wallet_balance = agent.wallet_balance - amount
    log = AgentWalletLog(
        agent_id=agent.id,
        transaction_type=WalletTransactionType.deduction,
        amount=amount,
        order_id=order.id,
        notes=f"خصم تلقائي لطلب رقم {order.order_number}",
    )
    db.add(log)
    return log


def refund_to_wallet(db: Session, agent: AgentProfile, amount: Decimal, order: Order) -> AgentWalletLog:
    agent.wallet_balance = agent.wallet_balance + amount
    log = AgentWalletLog(
        agent_id=agent.id,
        transaction_type=WalletTransactionType.refund,
        amount=amount,
        order_id=order.id,
        notes=f"استرداد لطلب رقم {order.order_number}",
    )
    db.add(log)
    return log


def list_wallet_logs(db: Session, agent: AgentProfile) -> list[AgentWalletLog]:
    return (
        db.query(AgentWalletLog)
        .filter(AgentWalletLog.agent_id == agent.id)
        .order_by(AgentWalletLog.created_at.desc())
        .all()
    )
