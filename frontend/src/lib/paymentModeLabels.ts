// File: frontend/src/lib/paymentModeLabels.ts

import type { PaymentMode } from "@/types/enums";

/** الاسم الظاهر بالعربية لكل وضع دفع متاح للوكلاء B2B. */
export const paymentModeLabels: Record<PaymentMode, string> = {
  prepaid_wallet: "محفظة مسبقة الدفع",
  credit_limit: "حد ائتماني",
  pay_per_order: "دفع لكل طلب",
};

/** الاسم الظاهر بالعربية لكل نوع حركة محفظة. */
export const walletTransactionTypeLabels: Record<string, string> = {
  deposit: "إيداع",
  deduction: "خصم",
  refund: "استرداد",
};
