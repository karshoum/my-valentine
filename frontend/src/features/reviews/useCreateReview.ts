// File: frontend/src/features/reviews/useCreateReview.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ReviewCreateRequest, ReviewOut } from "@/types/review";

/** ينشئ رأياً/تقييماً جديداً باسم المستخدم الحالي المسجَّل دخوله، مع حالتي التحميل والخطأ. */
export function useCreateReview() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = async (payload: ReviewCreateRequest): Promise<ReviewOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<ReviewOut>("/api/v1/reviews", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إرسال رأيك"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createReview, isSubmitting, error };
}
