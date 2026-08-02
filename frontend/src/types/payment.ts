// File: frontend/src/types/payment.ts

import type { PaymentMethod, PaymentStatus } from "@/types/enums";

/** مطابق لـ app.schemas.payment.PaymentOut. */
export interface PaymentOut {
  id: number;
  order_id: number;
  order_number: string;
  order_total_amount: string;
  order_currency_code: string;
  payment_method: PaymentMethod;
  amount: string;
  currency_code: string | null;
  transaction_ref: string | null;
  receipt_signed_url: string | null;
  status: PaymentStatus;
  verified_by: number | null;
  verified_at: string | null;
  created_at: string;
}

/** مطابق لـ app.schemas.payment.PaymentVerifyRequest. */
export interface PaymentVerifyRequest {
  approve: boolean;
  notes: string | null;
}
