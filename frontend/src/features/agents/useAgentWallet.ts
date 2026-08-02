// File: frontend/src/features/agents/useAgentWallet.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { AgentWalletLog } from "@/types/wallet";

/** يجلب حركات محفظة وكيل معيّن، ويوفّر دالة إيداع مبلغ جديد (موظف/مدير فقط). */
export function useAgentWallet(agentId: number) {
  const [logs, setLogs] = useState<AgentWalletLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDepositing, setIsDepositing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetchLogs = useCallback(() => {
    setIsLoading(true);
    return apiClient
      .get<AgentWalletLog[]>(`/api/v1/agents/${agentId}/wallet/logs`)
      .then((response) => setLogs(response.data))
      .catch(() => setError("تعذّر جلب حركات المحفظة"))
      .finally(() => setIsLoading(false));
  }, [agentId]);

  useEffect(() => {
    refetchLogs();
  }, [refetchLogs]);

  const deposit = async (amount: string, notes: string | null): Promise<boolean> => {
    setIsDepositing(true);
    setError(null);

    try {
      await apiClient.post(`/api/v1/agents/${agentId}/wallet/deposit`, { amount, notes });
      await refetchLogs();
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر إيداع المبلغ في المحفظة"));
      return false;
    } finally {
      setIsDepositing(false);
    }
  };

  return { logs, isLoading, isDepositing, error, deposit };
}
