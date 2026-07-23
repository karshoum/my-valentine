// File: frontend/src/types/enums.ts

/** مطابق لـ app.models.enums.UserRole. */
export type UserRole = "admin" | "employee" | "agent" | "customer";

/** مطابق لـ app.models.enums.PaymentMode. */
export type PaymentMode = "prepaid_wallet" | "credit_limit" | "pay_per_order";

/** مطابق لـ app.models.enums.ServiceCategory. */
export type ServiceCategory =
  | "flight"
  | "ship_ticket"
  | "visa"
  | "residency"
  | "insurance"
  | "renewal_extension"
  | "security_approval"
  | "procedure_package"
  | "tourism_package"
  | "document_extraction"
  | "attestation";

/** مطابق لـ app.models.enums.OrderStatus. */
export type OrderStatus =
  | "pending"
  | "processing"
  | "in_system"
  | "completed"
  | "rejected"
  | "refunded";

/** مطابق لـ app.models.enums.PaymentMethod. */
export type PaymentMethod = "bankak" | "visa" | "agent_wallet";

/** مطابق لـ app.models.enums.PaymentStatus. */
export type PaymentStatus = "pending" | "verified" | "rejected";

/** مطابق لـ app.models.enums.RefundStatus. */
export type RefundStatus = "pending" | "approved" | "processed" | "declined";

/** مطابق لـ app.models.enums.WalletTransactionType. */
export type WalletTransactionType = "deposit" | "deduction" | "refund";

/** مطابق لـ app.models.enums.LeadServiceType. */
export type LeadServiceType = "logistics" | "media_ads";
