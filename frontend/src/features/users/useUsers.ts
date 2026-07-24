// File: frontend/src/features/users/useUsers.ts

import { useCallback, useEffect, useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { UserRole } from "@/types/enums";
import type { UserOut } from "@/types/user";

/** يجلب كل المستخدمين (admin فقط)، مع تصفية اختيارية حسب الدور وإعادة جلب يدوية. */
export function useUsers(role: UserRole | null = null) {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<UserOut[]>("/api/v1/users", {
        params: role ? { role } : undefined,
      });
      setUsers(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر تحميل قائمة المستخدمين"));
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
