// File: frontend/src/features/profile/useCurrentUserProfile.ts

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import type { UserOut } from "@/types/user";

/** يجلب بيانات المستخدم الحالي الكاملة (الاسم، البريد، الهاتف، تاريخ الانضمام). */
export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .get<UserOut>("/api/v1/users/me")
      .then((response) => {
        if (isMounted) setProfile(response.data);
      })
      .catch(() => {
        if (isMounted) setError("تعذّر جلب بيانات الحساب");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { profile, isLoading, error };
}
