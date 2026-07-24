// File: frontend/src/features/public/BookNowLink.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";

interface BookNowLinkProps {
  className: string;
  children: ReactNode;
}

/**
 * رابط "احجز الآن" الموحَّد: يوجّه زائراً غير مسجَّل لإنشاء حساب، ويوجّه
 * مستخدماً مسجَّلاً دخوله فعلاً مباشرة لشاشة طلباته لإكمال الحجز من
 * هناك — بدل تكرار نفس رابط التسجيل الذي يُعيد توجيه المستخدمين
 * المسجَّلين لجذر لوحة التحكم بلا أي سياق.
 */
export function BookNowLink({ className, children }: BookNowLinkProps) {
  const { isAuthenticated } = useAuth();
  return (
    <Link to={isAuthenticated ? "/dashboard/orders" : "/register"} className={className}>
      {children}
    </Link>
  );
}
