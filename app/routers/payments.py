# File: app/routers/payments.py

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import require_staff
from app.core.security import get_current_user
from app.models.enums import PaymentMethod
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentOut, PaymentSubmitRequest, PaymentVerifyRequest
from app.services import payment_service

router = APIRouter(prefix="/api/v1/payments", tags=["الدفع (بنكك / فيزا) والمراجعة اليدوية"])


@router.post("/orders/{order_id}", response_model=PaymentOut, status_code=status.HTTP_201_CREATED)
def submit_payment(
    order_id: int,
    payment_method: PaymentMethod = Form(...),
    amount: float = Form(...),
    currency_code: str | None = Form(None),
    transaction_ref: str | None = Form(None),
    receipt_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Payment:
    """يرفع محاولة دفع (بنكك أو فيزا) لطلب قائم، بحالة pending دائماً."""
    payload = PaymentSubmitRequest(
        payment_method=payment_method,
        amount=amount,
        currency_code=currency_code,
        transaction_ref=transaction_ref,
    )
    return payment_service.submit_payment(db, order_id, current_user, payload, receipt_file)


@router.patch("/{payment_id}/verify", response_model=PaymentOut)
def verify_payment(
    payment_id: int,
    payload: PaymentVerifyRequest,
    db: Session = Depends(get_db),
    staff_user: User = Depends(require_staff),
) -> Payment:
    """
    مراجعة يدوية إلزامية من موظف أو مدير قبل انتقال الطلب من pending إلى
    processing. لا يوجد أي مسار آخر يؤكد الدفع تلقائياً.
    """
    return payment_service.verify_payment(db, payment_id, payload.approve, payload.notes, staff_user)
