// File: frontend/src/types/lead.ts

import type { LeadServiceType } from "@/types/enums";

/** مطابق لـ app.schemas.lead.LeadCreateRequest. */
export interface LeadCreateRequest {
  service_type: LeadServiceType;
  customer_name: string;
  phone: string;
  details: string | null;
}

/** مطابق لـ app.schemas.lead.LeadOut. */
export interface LeadOut {
  id: number;
  service_type: LeadServiceType;
  customer_name: string;
  phone: string;
  details: string | null;
  created_at: string;
}
