// File: frontend/src/features/profile/useMyAgentProfile.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { AgentOut } from "@/types/agent";

/** يجلب ملف الوكيل B2B الخاص بالمستخدم الحالي (لحسابات agent فقط). */
export function useMyAgentProfile(shouldFetch: boolean) {
  const [agentProfile, setAgentProfile] = useState<AgentOut | null>(null);
  const [isLoading, setIsLoading] = useState(shouldFetch);

  useEffect(() => {
    if (!shouldFetch) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    apiClient
      .get<AgentOut>("/api/v1/agents/me")
      .then((response) => {
        if (isMounted) setAgentProfile(response.data);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shouldFetch]);

  return { agentProfile, isLoading };
}
