// File: frontend/src/features/refunds/useDecideRefund.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { RefundOut } from "@/types/refund";

/** يعتمد أو يرفض طلب استرداد معلَّقاً (admin فقط). */
export function useDecideRefund() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveRefund = async (refundId: number): Promise<RefundOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<RefundOut>(`/api/v1/refunds/${refundId}/approve`);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر اعتماد طلب الاسترداد"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const declineRefund = async (refundId: number, notes: string | null): Promise<RefundOut | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<RefundOut>(`/api/v1/refunds/${refundId}/decline`, { notes });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر رفض طلب الاسترداد"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { approveRefund, declineRefund, isSubmitting, error };
}
