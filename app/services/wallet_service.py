# File: app/services/wallet_service.py

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
    """
    يودع مبلغاً في محفظة وكيل (بصلاحية موظف/مدير)، ويسجّل الحركة.

    Args:
        db: جلسة قاعدة البيانات.
        agent: ملف الوكيل المستهدَف.
        amount: المبلغ المُراد إيداعه (يجب أن يكون أكبر من صفر).
        admin_user: الموظف/المدير الذي ينفّذ الإيداع.
        notes: ملاحظة اختيارية ترافق الحركة.

    Returns:
        AgentWalletLog: سجل الحركة المُضاف.

    Raises:
        AppException: 400 إذا كان المبلغ صفراً أو سالباً.
    """
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
    """
    يخصم قيمة طلب من محفظة وكيل وفق وضع الدفع الخاص به.

    يقفل صف الوكيل في قاعدة البيانات (SELECT ... FOR UPDATE) قبل فحص
    الرصيد وخصمه، لمنع سباق تزامن: لو وصل طلبان لنفس الوكيل في نفس
    اللحظة، كل واحد كان سيرى نفس الرصيد القديم ويمر فحص الكفاية بشكل
    منفصل، فيتجاوز مجموع الخصمين الرصيد أو الحد الائتماني المسموح رغم
    رفض كل طلب لو نُفِّذ منفرداً بعد الآخر. القفل يُحرَّر تلقائياً مع
    commit/rollback الجلسة التي تستدعي هذه الدالة.

    Args:
        db: جلسة قاعدة البيانات.
        agent: ملف الوكيل صاحب الطلب.
        order: الطلب المُراد خصم قيمته.

    Returns:
        AgentWalletLog: سجل حركة الخصم المُضاف (لم يُنفَّذ commit بعد).

    Raises:
        AppException: 400 إذا كان وضع الدفع pay_per_order، أو إذا كان
        الرصيد/الحد الائتماني غير كافٍ.
    """
    amount = order.total_amount

    if agent.payment_mode == PaymentMode.pay_per_order:
        raise AppException(
            "وضع الدفع الخاص بهذا الوكيل لا يسمح بالخصم من المحفظة، يجب الدفع عبر بنكك أو فيزا",
            status_code=400,
        )

    locked_agent = (
        db.query(AgentProfile).filter(AgentProfile.id == agent.id).populate_existing().with_for_update().one()
    )

    if locked_agent.payment_mode == PaymentMode.prepaid_wallet:
        if locked_agent.wallet_balance < amount:
            raise AppException("رصيد المحفظة غير كافٍ لإتمام هذا الطلب", status_code=400)

    elif locked_agent.payment_mode == PaymentMode.credit_limit:
        projected_balance = locked_agent.wallet_balance - amount
        if projected_balance < -locked_agent.credit_limit:
            raise AppException("تجاوزت الحد الائتماني المسموح لحسابك", status_code=400)

    locked_agent.wallet_balance = locked_agent.wallet_balance - amount
    log = AgentWalletLog(
        agent_id=locked_agent.id,
        transaction_type=WalletTransactionType.deduction,
        amount=amount,
        order_id=order.id,
        notes=f"خصم تلقائي لطلب رقم {order.order_number}",
    )
    db.add(log)
    return log


def refund_to_wallet(db: Session, agent: AgentProfile, amount: Decimal, order: Order) -> AgentWalletLog:
    """
    يعيد مبلغاً إلى محفظة وكيل عند استرداد طلب، ويسجّل الحركة.

    Args:
        db: جلسة قاعدة البيانات.
        agent: ملف الوكيل المستفيد من الاسترداد.
        amount: المبلغ المُراد إعادته.
        order: الطلب المرتبط بالاسترداد.

    Returns:
        AgentWalletLog: سجل حركة الاسترداد المُضاف (لم يُنفَّذ commit بعد).
    """
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
    """يُعيد كل حركات محفظة وكيل مرتبة تنازلياً حسب التاريخ."""
    return (
        db.query(AgentWalletLog)
        .filter(AgentWalletLog.agent_id == agent.id)
        .order_by(AgentWalletLog.created_at.desc())
        .all()
    )
