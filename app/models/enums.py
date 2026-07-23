# File: app/models/enums.py

"""
كل الأنواع التعدادية (Enums) المستخدمة عبر نماذج قاعدة البيانات، مطابقة
تماماً لقيم الأعمدة المقيَّدة بـ CHECK في المخطط المعتمد.
"""

import enum


class UserRole(str, enum.Enum):
    """أدوار المستخدمين الأربعة في النظام."""

    admin = "admin"
    employee = "employee"
    agent = "agent"
    customer = "customer"


class PaymentMode(str, enum.Enum):
    """أوضاع الدفع الثلاثة المتاحة لكل وكيل B2B."""

    prepaid_wallet = "prepaid_wallet"
    credit_limit = "credit_limit"
    pay_per_order = "pay_per_order"


class ServiceCategory(str, enum.Enum):
    """تصنيفات الخدمات المعروضة للعملاء والوكلاء."""

    flight = "flight"
    ship_ticket = "ship_ticket"
    visa = "visa"
    residency = "residency"
    insurance = "insurance"
    renewal_extension = "renewal_extension"
    security_approval = "security_approval"
    procedure_package = "procedure_package"
    tourism_package = "tourism_package"
    document_extraction = "document_extraction"
    attestation = "attestation"


class OrderStatus(str, enum.Enum):
    """حالات دورة حياة الطلب، بترتيب الانتقال المسموح في order_service."""

    pending = "pending"
    processing = "processing"
    in_system = "in_system"
    completed = "completed"
    rejected = "rejected"
    refunded = "refunded"


class PaymentMethod(str, enum.Enum):
    """طرق الدفع المدعومة."""

    bankak = "bankak"
    visa = "visa"
    agent_wallet = "agent_wallet"


class PaymentStatus(str, enum.Enum):
    """حالة مراجعة الدفع اليدوية."""

    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class RefundStatus(str, enum.Enum):
    """حالة دورة حياة طلب الاسترداد."""

    pending = "pending"
    approved = "approved"
    processed = "processed"
    declined = "declined"


class WalletTransactionType(str, enum.Enum):
    """أنواع حركات محفظة الوكيل."""

    deposit = "deposit"
    deduction = "deduction"
    refund = "refund"


class LeadServiceType(str, enum.Enum):
    """أنواع طلبات الاهتمام (Leads) للخدمات المستقبلية."""

    logistics = "logistics"
    media_ads = "media_ads"
