// File: frontend/src/features/auth/AuthContext.tsx

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/authContext";
import { apiClient } from "@/lib/apiClient";
import { clearAuthSession, getStoredFullName, getStoredRole, getStoredToken, saveAuthSession } from "@/lib/authStorage";
import type { UserRole } from "@/types/enums";
import type { LoginRequest, TokenResponse } from "@/types/user";

/** يوفّر حالة المصادقة لكل شجرة المكوّنات، ويهيّئها من localStorage عند الإقلاع. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(() => getStoredRole());
  const [fullName, setFullName] = useState<string | null>(() => getStoredFullName());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await apiClient.post<TokenResponse>("/api/v1/auth/login", credentials);
    const { access_token, role: userRole, full_name } = response.data;
    saveAuthSession(access_token, userRole, full_name);
    setToken(access_token);
    setRole(userRole);
    setFullName(full_name);
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    setToken(null);
    setRole(null);
    setFullName(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: Boolean(token), role, fullName, login, logout }),
    [token, role, fullName, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
