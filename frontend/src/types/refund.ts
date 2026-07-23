// File: frontend/src/types/refund.ts

import type { RefundStatus } from "@/types/enums";

/** مطابق لـ app.schemas.refund.RefundOut. */
export interface RefundOut {
  id: number;
  order_id: number;
  order_number: string;
  refund_amount: string;
  currency_code: string | null;
  reason: string | null;
  status: RefundStatus;
  processed_by: number | null;
  processed_at: string | null;
}

/** مطابق لـ app.schemas.refund.RefundCreateRequest. */
export interface RefundCreateRequest {
  refund_amount: string;
  currency_code: string | null;
  reason: string | null;
}

/** مطابق لـ app.schemas.refund.RefundDecisionRequest. */
export interface RefundDecisionRequest {
  notes: string | null;
}
