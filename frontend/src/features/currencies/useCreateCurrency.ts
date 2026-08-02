// File: frontend/src/features/currencies/useCreateCurrency.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { CurrencyCreateRequest, CurrencyOut } from "@/types/currency";

/** يضيف عملة جديدة بسعر ابتدائي (admin فقط). */
export function useCreateCurrency() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCurrency = async (payload: CurrencyCreateRequest): Promise<CurrencyOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<CurrencyOut>("/api/v1/currencies", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إضافة العملة"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createCurrency, isSubmitting, error };
}
