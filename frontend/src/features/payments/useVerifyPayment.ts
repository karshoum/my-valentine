// File: frontend/src/features/payments/useVerifyPayment.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { PaymentOut } from "@/types/payment";

/** يعتمد أو يرفض محاولة دفع معلَّقة بعد مراجعتها يدوياً (موظف/مدير فقط). */
export function useVerifyPayment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyPayment = async (paymentId: number, approve: boolean, notes: string | null): Promise<PaymentOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<PaymentOut>(`/api/v1/payments/${paymentId}/verify`, { approve, notes });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تسجيل قرار المراجعة"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { verifyPayment, isSubmitting, error };
}
