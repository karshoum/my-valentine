// File: frontend/src/features/refunds/useProcessRefund.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { RefundOut } from "@/types/refund";

/** ينفّذ استرداداً معتمَداً فعلياً: ينقل الطلب لحالة refunded ويعيد المبلغ لمحفظة الوكيل إن انطبق (admin فقط). */
export function useProcessRefund() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processRefund = async (refundId: number): Promise<RefundOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.post<RefundOut>(`/api/v1/refunds/${refundId}/process`);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تنفيذ الاسترداد"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { processRefund, isSubmitting, error };
}
