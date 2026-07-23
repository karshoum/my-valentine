// File: frontend/src/types/flightBooking.ts

import type { FlightBookingFeeType } from "@/types/enums";

/** مطابق لـ app.schemas.flight_booking.FlightOfferOut. */
export interface FlightOfferOut {
  airline_code: string;
  airline_name: string;
  origin: string;
  destination: string;
  departure_at: string;
  arrival_at: string;
  stops: number;
  duration_minutes: number;
  base_fare_usd: string;
  fee_amount_usd: string;
  total_price_usd: string;
}

/** مطابق لـ app.schemas.flight_booking.FlightBookingFeeSettingOut. */
export interface FlightBookingFeeSettingOut {
  fee_type: FlightBookingFeeType;
  fee_value: string;
  updated_at: string | null;
}

/** مطابق لـ app.schemas.flight_booking.FlightBookingFeeUpdateRequest. */
export interface FlightBookingFeeUpdateRequest {
  fee_type: FlightBookingFeeType;
  fee_value: string;
}

/** مطابق لـ app.schemas.flight_booking.FlightBookingCreateRequest. */
export interface FlightBookingCreateRequest {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  airline_name: string;
  base_fare_usd: string;
}

/** مطابق لـ app.schemas.flight_booking.FlightBookingDetailOut. */
export interface FlightBookingDetailOut {
  id: number;
  order_id: number;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  airline_name: string;
  base_fare_usd: string;
  fee_amount_usd: string;
}
