// File: frontend/src/types/wallet.ts

import type { WalletTransactionType } from "@/types/enums";

/** مطابق لحقول app.models.wallet.AgentWalletLog كما تُعاد في الاستجابة (بلا Schema صريح). */
export interface AgentWalletLog {
  id: number;
  agent_id: number;
  transaction_type: WalletTransactionType;
  amount: number;
  order_id: number | null;
  notes: string | null;
  created_at: string;
}
