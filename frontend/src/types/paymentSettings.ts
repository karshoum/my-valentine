// File: frontend/src/types/paymentSettings.ts

/** مطابق لـ app.schemas.payment_settings.PaymentSettingsOut. */
export interface PaymentSettingsOut {
  bankak_account_number: string | null;
  bankak_account_name: string | null;
  bankak_is_enabled: boolean;
  visa_whatsapp_number: string | null;
  visa_is_enabled: boolean;
  updated_at: string | null;
}

/** مطابق لـ app.schemas.payment_settings.PaymentSettingsUpdateRequest. */
export interface PaymentSettingsUpdateRequest {
  bankak_account_number?: string | null;
  bankak_account_name?: string | null;
  bankak_is_enabled?: boolean;
  visa_whatsapp_number?: string | null;
  visa_is_enabled?: boolean;
}
