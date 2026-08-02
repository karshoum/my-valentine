// File: frontend/src/features/refunds/useCreateRefund.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { RefundCreateRequest, RefundOut } from "@/types/refund";

/** ينشئ طلب استرداد جديداً لطلب قائم (بحالة pending دائماً). */
export function useCreateRefund() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRefund = async (orderId: number, payload: RefundCreateRequest): Promise<RefundOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<RefundOut>(`/api/v1/refunds/orders/${orderId}`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إنشاء طلب الاسترداد"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createRefund, isSubmitting, error };
}
