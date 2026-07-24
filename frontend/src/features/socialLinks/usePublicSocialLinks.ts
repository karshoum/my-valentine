// File: frontend/src/features/socialLinks/usePublicSocialLinks.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { SocialLinkOut } from "@/types/socialLink";

/** يجلب روابط التواصل المُفعَّلة فقط لعرضها في الصفحة العامة (عام، بلا تسجيل دخول). */
export function usePublicSocialLinks() {
  const [links, setLinks] = useState<SocialLinkOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<SocialLinkOut[]>("/api/v1/social-links")
      .then((response) => setLinks(response.data))
      .catch(() => setLinks([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { links, isLoading };
}
