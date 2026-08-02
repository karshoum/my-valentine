// File: frontend/src/features/agents/useAgents.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { AgentOut } from "@/types/agent";

/** يجلب كل ملفات الوكلاء B2B (موظف/مدير فقط)، مع إمكانية إعادة الجلب. */
export function useAgents() {
  const [agents, setAgents] = useState<AgentOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return apiClient
      .get<AgentOut[]>("/api/v1/agents")
      .then((response) => setAgents(response.data))
      .catch(() => setError("تعذّر جلب قائمة الوكلاء من الخادم"))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { agents, isLoading, error, refetch };
}
