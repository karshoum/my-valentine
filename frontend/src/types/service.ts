// File: frontend/src/types/service.ts

import type { ServiceCategory } from "@/types/enums";

/** مطابق لـ app.schemas.service.ServiceOut (بلا تفاصيل الفيزا/الإقامة). */
export interface ServiceOut {
  id: number;
  category: ServiceCategory;
  title: string;
  description: string | null;
  base_price_usd: string;
  is_active: boolean;
  created_at: string;
}
