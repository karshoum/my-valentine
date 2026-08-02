// File: frontend/src/features/agents/usePromoteToAgent.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { AgentOut, AgentPromoteRequest } from "@/types/agent";

/** يرقّي حساب عميل عادي موجود إلى وكيل B2B (admin فقط)، مع حالتي التحميل والخطأ. */
export function usePromoteToAgent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promoteToAgent = async (payload: AgentPromoteRequest): Promise<AgentOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<AgentOut>("/api/v1/agents/promote", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر ترقية الحساب لوكيل"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { promoteToAgent, isSubmitting, error };
}
