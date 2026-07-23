// File: frontend/src/lib/authStorage.ts

import type { UserRole } from "@/types/enums";

const TOKEN_KEY = "baradis_access_token";
const ROLE_KEY = "baradis_user_role";
const NAME_KEY = "baradis_user_name";

/** يحفظ بيانات جلسة الدخول (التوكن والدور والاسم) في localStorage. */
export function saveAuthSession(token: string, role: UserRole, fullName: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(NAME_KEY, fullName);
}

/** يمسح كل بيانات جلسة الدخول المحفوظة (عند تسجيل الخروج أو انتهاء الصلاحية). */
export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(NAME_KEY);
}

/** يُعيد توكن الدخول المحفوظ، أو null إن لم يكن هناك جلسة نشطة. */
export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** يُعيد دور المستخدم الحالي المحفوظ، أو null إن لم يكن هناك جلسة نشطة. */
export function getStoredRole(): UserRole | null {
  return localStorage.getItem(ROLE_KEY) as UserRole | null;
}

/** يُعيد اسم المستخدم الحالي المحفوظ، أو null إن لم يكن هناك جلسة نشطة. */
export function getStoredFullName(): string | null {
  return localStorage.getItem(NAME_KEY);
}
