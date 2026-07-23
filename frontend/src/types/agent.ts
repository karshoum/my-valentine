// File: frontend/src/types/agent.ts

import type { PaymentMode } from "@/types/enums";

/** مطابق لـ app.schemas.agent.AgentOut. */
export interface AgentOut {
  id: number;
  user_id: number;
  agency_name: string;
  payment_mode: PaymentMode;
  wallet_balance: string;
  credit_limit: string;
  discount_rate: string;
  created_at: string;
}

/** مطابق لـ app.schemas.agent.CustomRateOut. */
export interface CustomRateOut {
  id: number;
  agent_id: number;
  service_id: number;
  custom_price_usd: string;
}
