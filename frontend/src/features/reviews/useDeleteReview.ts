// File: frontend/src/features/reviews/useDeleteReview.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";

/** يحذف رأياً نهائياً (admin فقط)، مع حالتي التحميل والخطأ. */
export function useDeleteReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteReview = async (reviewId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/reviews/${reviewId}`);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حذف الرأي"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { deleteReview, isSubmitting, error };
}
