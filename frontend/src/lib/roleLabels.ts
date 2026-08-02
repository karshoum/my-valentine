// File: frontend/src/lib/roleLabels.ts

import type { UserRole } from "@/types/enums";

/** الاسم الظاهر بالعربية لكل دور مستخدم. */
export const roleLabels: Record<UserRole, string> = {
  admin: "مدير تنفيذي",
  employee: "موظف",
  agent: "وكيل B2B",
  customer: "عميل",
};
