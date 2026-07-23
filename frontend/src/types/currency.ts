// File: frontend/src/types/currency.ts

/** مطابق لـ app.schemas.currency.CurrencyOut. */
export interface CurrencyOut {
  id: number;
  code: string;
  name: string;
  rate_to_usd: string;
  is_manual: boolean;
  updated_by: number | null;
  updated_at: string;
}

/** مطابق لـ app.schemas.currency.CurrencyManualUpdateRequest. */
export interface CurrencyManualUpdateRequest {
  rate_to_usd: string;
}
