// File: frontend/src/features/public/usePublicFlightSearch.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { FlightOfferOut } from "@/types/flightBooking";

interface SearchParams {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  adults: number;
  children: number;
  infants: number;
}

/** يبحث عن رحلات طيران حقيقية عبر المسار العام (بلا حاجة لتسجيل دخول). */
export function usePublicFlightSearch() {
  const [offers, setOffers] = useState<FlightOfferOut[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = (params: SearchParams) => {
    setIsSearching(true);
    setError(null);
    setOffers([]);

    apiClient
      .get<FlightOfferOut[]>("/api/v1/flight-bookings/search", { params })
      .then((response) => setOffers(response.data))
      .catch((err) => {
        const message = err?.response?.data?.detail ?? "تعذّر البحث عن الرحلات، حاول لاحقاً";
        setError(message);
      })
      .finally(() => setIsSearching(false));
  };

  return { offers, search, isSearching, error };
}
