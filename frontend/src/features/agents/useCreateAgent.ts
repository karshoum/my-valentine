// File: frontend/src/features/agents/useCreateAgent.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { AgentCreateRequest, AgentOut } from "@/types/agent";

/** ينشئ حساب وكيل B2B جديداً (admin فقط)، مع حالتي التحميل والخطأ. */
export function useCreateAgent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAgent = async (payload: AgentCreateRequest): Promise<AgentOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<AgentOut>("/api/v1/agents", payload);
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إنشاء حساب الوكيل"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createAgent, isSubmitting, error };
}
