// File: frontend/src/features/agents/useUpdateAgent.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { AgentOut, AgentUpdateRequest } from "@/types/agent";

/** يحدّث حقول ملف وكيل جزئياً (admin فقط)، مع حالتي التحميل والخطأ. */
export function useUpdateAgent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAgent = async (agentId: number, payload: AgentUpdateRequest): Promise<AgentOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.patch<AgentOut>(`/api/v1/agents/${agentId}`, payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث بيانات الوكيل"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { updateAgent, isSubmitting, error };
}
