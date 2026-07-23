// File: frontend/src/features/services/useCreateService.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { ServiceCreateRequest, ServiceOut } from "@/types/service";

/** ينشئ خدمة جديدة في الكتالوج (موظف أو مدير فقط). */
export function useCreateService() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = async (payload: ServiceCreateRequest): Promise<ServiceOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<ServiceOut>("/api/v1/services", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إنشاء الخدمة"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createService, isSubmitting, error };
}
