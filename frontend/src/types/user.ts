// File: frontend/src/types/user.ts

import type { UserRole } from "@/types/enums";

/** مطابق لـ app.schemas.user.UserOut. */
export interface UserOut {
  id: number;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
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

/** مطابق لـ app.schemas.auth.RegisterRequest. */
export interface RegisterRequest {
  full_name: string;
  email: string | null;
  phone: string;
  password: string;
}

/** مطابق لـ app.schemas.auth.GoogleLoginRequest. */
export interface GoogleLoginRequest {
  id_token: string;
}

/** مطابق لـ app.schemas.user.PasswordChangeRequest. */
export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

/** مطابق لـ app.schemas.auth.ForgotPasswordRequest. */
export interface ForgotPasswordRequest {
  identifier: string;
}

/** مطابق لـ app.schemas.auth.ResetPasswordRequest. */
export interface ResetPasswordRequest {
  uid: number;
  expires: number;
  signature: string;
  new_password: string;
}

/** مطابق لـ app.schemas.user.ProfileUpdateRequest. */
export interface ProfileUpdateRequest {
  full_name?: string;
  email?: string | null;
  whatsapp_number?: string | null;
}

/** مطابق لـ app.schemas.user.AccountDeactivationRequest. */
export interface AccountDeactivationRequest {
  password: string;
}

/** مطابق لـ app.schemas.user.StaffCreateRequest. */
export interface StaffCreateRequest {
  full_name: string;
  email: string | null;
  phone: string;
  password: string;
  role: "admin" | "employee";
}
