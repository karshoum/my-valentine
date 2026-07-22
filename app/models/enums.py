import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"
    agent = "agent"
    customer = "customer"


class PaymentMode(str, enum.Enum):
    prepaid_wallet = "prepaid_wallet"
    credit_limit = "credit_limit"
    pay_per_order = "pay_per_order"


class ServiceCategory(str, enum.Enum):
    flight = "flight"
    visa = "visa"
    residency = "residency"
    insurance = "insurance"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    in_system = "in_system"
    completed = "completed"
    rejected = "rejected"
    refunded = "refunded"


class PaymentMethod(str, enum.Enum):
    bankak = "bankak"
    visa = "visa"
    agent_wallet = "agent_wallet"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"


class RefundStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    processed = "processed"
    declined = "declined"


class WalletTransactionType(str, enum.Enum):
    deposit = "deposit"
    deduction = "deduction"
    refund = "refund"


class LeadServiceType(str, enum.Enum):
    logistics = "logistics"
    media_ads = "media_ads"
