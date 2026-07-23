// File: frontend/src/features/flights/useSearchFlights.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { FlightOfferOut } from "@/types/flightBooking";

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  adults: number;
}

/** يبحث عن رحلات طيران/بواخر حقيقية بين مدينتين (يتطلّب تسجيل دخول). */
export function useSearchFlights() {
  const [offers, setOffers] = useState<FlightOfferOut[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (params: FlightSearchParams) => {
    setIsSearching(true);
    setError(null);
    try {
      const response = await apiClient.get<FlightOfferOut[]>("/api/v1/flight-bookings/search", { params });
      setOffers(response.data);
    } catch (err) {
      setOffers([]);
      setError(extractErrorMessage(err, "تعذّر البحث عن رحلات، حاول مرة أخرى"));
    } finally {
      setIsSearching(false);
    }
  };

  return { offers, search, isSearching, error };
}
