// File: frontend/src/features/services/useUpdateService.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ServiceOut, ServiceUpdateRequest } from "@/types/service";

/** يحدّث حقول خدمة جزئياً (موظف أو مدير فقط). */
export function useUpdateService() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateService = async (serviceId: number, payload: ServiceUpdateRequest): Promise<ServiceOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<ServiceOut>(`/api/v1/services/${serviceId}`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث الخدمة"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateService, isSubmitting, error };
}
