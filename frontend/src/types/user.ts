// File: frontend/src/types/user.ts

import type { UserRole } from "@/types/enums";

/** مطابق لـ app.schemas.user.UserOut. */
export interface UserOut {
  id: number;
  full_name: string;
  email: string | null;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

/** مطابق لـ app.schemas.auth.TokenResponse. */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  full_name: string;
}

/** مطابق لـ app.schemas.auth.LoginRequest. */
export interface LoginRequest {
  identifier: string;
  password: string;
}
