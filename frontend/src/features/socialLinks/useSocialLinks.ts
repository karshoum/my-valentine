// File: frontend/src/features/socialLinks/useSocialLinks.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { SocialLinkOut } from "@/types/socialLink";

/** يجلب كل روابط التواصل (مفعّلة وموقوفة) لإدارتها من لوحة التحكم (موظف أو مدير فقط). */
export function useSocialLinks() {
  const [links, setLinks] = useState<SocialLinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<SocialLinkOut[]>("/api/v1/social-links/all");
      setLinks(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحميل روابط التواصل"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return { links, isLoading, error, refetch: fetchLinks };
}
