// File: frontend/src/features/flights/useFlightBookingFeeSetting.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { FlightBookingFeeSettingOut, FlightBookingFeeUpdateRequest } from "@/types/flightBooking";

/** يجلب إعداد رسوم حجز الطيران الحالي، ويوفّر دالة لتحديثه (admin فقط). */
export function useFlightBookingFeeSetting() {
  const [setting, setSetting] = useState<FlightBookingFeeSettingOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = () => {
    setIsLoading(true);
    apiClient
      .get<FlightBookingFeeSettingOut>("/api/v1/flight-bookings/fee-setting")
      .then((response) => setSetting(response.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(refetch, []);

  const updateSetting = async (payload: FlightBookingFeeUpdateRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await apiClient.patch<FlightBookingFeeSettingOut>(
        "/api/v1/flight-bookings/fee-setting",
        payload,
      );
      setSetting(response.data);
      return true;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحديث رسوم الحجز"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setting, isLoading, updateSetting, isSubmitting, error };
}
