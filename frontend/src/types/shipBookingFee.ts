// File: frontend/src/types/shipBookingFee.ts

import type { FlightBookingFeeType } from "@/types/enums";

/** مطابق لـ app.schemas.ship_booking_fee.ShipBookingFeeSettingOut. */
export interface ShipBookingFeeSettingOut {
  fee_type: FlightBookingFeeType;
  fee_value: string;
  updated_at: string | null;
}

/** مطابق لـ app.schemas.ship_booking_fee.ShipBookingFeeUpdateRequest. */
export interface ShipBookingFeeUpdateRequest {
  fee_type: FlightBookingFeeType;
  fee_value: string;
}

/** مطابق لـ app.schemas.ship_booking_fee.ShipRouteQuoteOut. */
export interface ShipRouteQuoteOut {
  base_subtotal_usd: string;
  fee_amount_usd: string;
  discount_percentage: string | null;
  fee_after_discount_usd: string;
  total_price_usd: string;
}
