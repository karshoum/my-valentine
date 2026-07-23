// File: frontend/src/features/auth/authContext.ts

import { createContext } from "react";

import type { UserRole } from "@/types/enums";
import type { LoginRequest } from "@/types/user";

/** الحالة الحالية للجلسة: المستخدم المسجَّل ودوال الدخول/الخروج. */
export interface AuthContextValue {
  isAuthenticated: boolean;
  role: UserRole | null;
  fullName: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
