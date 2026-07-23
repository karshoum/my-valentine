// File: frontend/src/features/agents/useSetCustomRate.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { CustomRateCreateRequest, CustomRateOut } from "@/types/agent";

/** يحدّد/يحدّث سعراً خاصاً لخدمة معينة لوكيل محدد (admin فقط). */
export function useSetCustomRate(agentId: number) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedRate, setLastSavedRate] = useState<CustomRateOut | null>(null);

  const setCustomRate = async (payload: CustomRateCreateRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<CustomRateOut>(`/api/v1/agents/${agentId}/rates`, payload);
      setLastSavedRate(response.data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر حفظ السعر الخاص"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setCustomRate, isSubmitting, error, lastSavedRate };
}
