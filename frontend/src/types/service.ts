// File: frontend/src/types/service.ts

import type { ServiceCategory } from "@/types/enums";

/** مطابق لـ app.schemas.service.VisaResidencyDetailIn. */
export interface VisaResidencyDetailIn {
  country: string;
  type: string;
  requirements: string | null;
  processing_time: string | null;
  is_dynamic_price: boolean;
}

/** مطابق لـ app.schemas.service.VisaResidencyDetailOut. */
export interface VisaResidencyDetailOut extends VisaResidencyDetailIn {
  id: number;
  service_id: number;
}

/** مطابق لـ app.schemas.service.ServiceOut. */
export interface ServiceOut {
  id: number;
  category: ServiceCategory;
  title: string;
  description: string | null;
  base_price_usd: string;
  is_active: boolean;
  created_at: string;
  discount_percentage: string | null;
  discount_valid_until: string | null;
  has_active_discount: boolean;
  effective_price_usd: string;
  visa_residency_detail: VisaResidencyDetailOut | null;
}

/** مطابق لـ app.schemas.service.ServiceCreateRequest. */
export interface ServiceCreateRequest {
  category: ServiceCategory;
  title: string;
  description: string | null;
  base_price_usd: string;
  visa_residency_detail: VisaResidencyDetailIn | null;
}

/** مطابق لـ app.schemas.service.ServiceUpdateRequest. */
export interface ServiceUpdateRequest {
  title?: string;
  description?: string | null;
  base_price_usd?: string;
  is_active?: boolean;
}

/** مطابق لـ app.schemas.service.ServiceDiscountUpdateRequest. */
export interface ServiceDiscountUpdateRequest {
  discount_percentage: string | null;
  discount_valid_until: string | null;
}
