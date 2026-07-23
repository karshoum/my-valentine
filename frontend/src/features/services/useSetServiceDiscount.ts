// File: frontend/src/features/services/useSetServiceDiscount.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ServiceDiscountUpdateRequest, ServiceOut } from "@/types/service";

/** يحدّد أو يلغي عرض خصم محدود المدة على خدمة (admin فقط). */
export function useSetServiceDiscount() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setDiscount = async (
    serviceId: number,
    payload: ServiceDiscountUpdateRequest,
  ): Promise<ServiceOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<ServiceOut>(`/api/v1/services/${serviceId}/discount`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث عرض الخصم"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setDiscount, isSubmitting, error };
}
