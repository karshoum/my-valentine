// File: frontend/src/features/auth/authContextValue.ts

import { createContext } from "react";

import type { UserRole } from "@/types/enums";
import type { LoginRequest } from "@/types/user";

/** الحالة الحالية للجلسة: المستخدم المسجَّل ودوال الدخول/الخروج. */
export interface AuthContextValue {
  isAuthenticated: boolean;
  role: UserRole | null;
  fullName: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  loginWithGoogle: (googleIdToken: string) => Promise<void>;
  logout: () => void;
  /** يحدّث توكن الجلسة الحالية بدون إعادة تسجيل دخول (بعد تغيير كلمة المرور مثلاً). */
  refreshToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
