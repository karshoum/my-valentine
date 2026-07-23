# File: app/models/payment.py

from sqlalchemy import DECIMAL, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base
from app.core.storage import generate_signed_url
from app.models.enums import PaymentMethod, PaymentStatus


class Payment(Base):
    """
    محاولة دفع واحدة لطلب (بنكك/فيزا/محفظة وكيل). تبقى بحالة pending
    حتى تُراجَع يدوياً عبر payment_service.verify_payment (باستثناء
    محفظة الوكيل التي تُخصم وتُؤكَّد تلقائياً عند إنشاء الطلب).
    """

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    payment_method = Column(Enum(PaymentMethod, name="payment_method"), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    currency_code = Column(String(5), ForeignKey("currencies.code"), nullable=True)
    receipt_image_url = Column(String(255), nullable=True)
    transaction_ref = Column(String(100), nullable=True)
    status = Column(Enum(PaymentStatus, name="payment_status"), default=PaymentStatus.pending, nullable=False)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="payments")

    @property
    def receipt_signed_url(self) -> str | None:
        """يُعيد رابطاً موقّعاً ومحدود الصلاحية لصورة إشعار الدفع إن وُجدت."""
        if not self.receipt_image_url:
            return None
        return generate_signed_url(self.receipt_image_url)

    @property
    def order_number(self) -> str:
        """يُعيد رقم الطلب المرتبط بهذا الدفع، لعرضه في شاشة مراجعة المدفوعات."""
        return self.order.order_number
