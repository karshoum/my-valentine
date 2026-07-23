// File: frontend/src/features/currencies/useUpdateCurrencyRate.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { CurrencyOut } from "@/types/currency";

/** يحدّث سعر صرف عملة يدوياً (admin فقط)، وهو المسار الوحيد المسموح لتغيير الأسعار في النظام. */
export function useUpdateCurrencyRate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRate = async (code: string, rateToUsd: string): Promise<CurrencyOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<CurrencyOut>(`/api/v1/currencies/${code}/rate`, {
        rate_to_usd: rateToUsd,
      });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث سعر الصرف"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateRate, isSubmitting, error };
}
