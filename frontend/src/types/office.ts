// File: frontend/src/types/office.ts

/** مطابق لـ app.schemas.office.OfficeCreateRequest. */
export interface OfficeCreateRequest {
  country: string;
  address_line: string;
  display_order: number;
  is_active: boolean;
}

/** مطابق لـ app.schemas.office.OfficeUpdateRequest. */
export interface OfficeUpdateRequest {
  country?: string;
  address_line?: string;
  display_order?: number;
  is_active?: boolean;
}

/** مطابق لـ app.schemas.office.OfficeOut. */
export interface OfficeOut {
  id: number;
  country: string;
  address_line: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}
