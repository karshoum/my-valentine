// File: frontend/src/lib/paymentMethodLabels.ts

import type { PaymentMethod } from "@/types/enums";

/** الاسم الظاهر بالعربية لكل طريقة دفع (مطابق لـ app.models.enums.PaymentMethod). */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bankak: "تحويل بنكك",
  visa: "فيزا",
  agent_wallet: "محفظة الوكيل",
};
