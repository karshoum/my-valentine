// File: frontend/src/features/reviews/useReviews.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { ReviewOut } from "@/types/review";

/** يجلب كل آراء العملاء لعرضها في الصفحة العامة (عام، بلا تسجيل دخول). */
export function useReviews() {
  const [reviews, setReviews] = useState<ReviewOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = useCallback(() => {
    setIsLoading(true);
    apiClient
      .get<ReviewOut[]>("/api/v1/reviews")
      .then((response) => setReviews(response.data))
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, isLoading, refetch: fetchReviews };
}
