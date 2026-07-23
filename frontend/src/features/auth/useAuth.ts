// File: frontend/src/features/auth/useAuth.ts

import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/features/auth/authContext";

/** يُعيد حالة المصادقة الحالية؛ يجب استدعاؤه داخل AuthProvider فقط. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth يجب أن يُستخدم داخل AuthProvider");
  }
  return context;
}
