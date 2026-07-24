// File: frontend/src/features/public/useCreateLead.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { LeadCreateRequest, LeadOut } from "@/types/lead";

/** يسجّل طلب اهتمام عام (Lead) بخدمة مستقبلية (عام، بلا تسجيل دخول)، مع حالتي التحميل والخطأ. */
export function useCreateLead() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLead = async (payload: LeadCreateRequest): Promise<LeadOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<LeadOut>("/api/v1/leads", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إرسال طلب الاهتمام"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createLead, isSubmitting, error };
}
