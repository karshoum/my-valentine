// File: frontend/src/features/public/BookNowLink.tsx

import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";
import type { FlightOfferOut } from "@/types/flightBooking";
import type { ServiceCategory } from "@/types/enums";

/** الحالة المُمرَّرة لشاشة الطلبات عند فتح نموذج طلب جديد تلقائياً من رابط "احجز الآن". */
export interface BookNowNavigationState {
  openNewOrder: true;
  category: ServiceCategory;
  /** معرّف الخدمة الدقيق (لأي خدمة غير طيران/بواخر، حيث قد يوجد أكثر من خدمة بنفس التصنيف — مثال: عدة تأشيرات دول مختلفة). */
  serviceId?: number;
  flightOffer?: FlightOfferOut;
}

interface BookNowLinkProps {
  className: string;
  children: ReactNode;
  category: ServiceCategory;
  /** مرّره عندما تعرف الخدمة بالضبط (خدمات الفيزا/الإقامة/إلخ) لتفادي اختيار أول خدمة عشوائية من نفس التصنيف. */
  serviceId?: number;
  flightOffer?: FlightOfferOut;
}

/**
 * رابط "احجز الآن" الموحَّد: يوجّه زائراً غير مسجَّل لإنشاء حساب، ويوجّه
 * مستخدماً مسجَّلاً دخوله فعلاً مباشرة لشاشة طلباته مع فتح نموذج "طلب
 * جديد" تلقائياً والخدمة المناسبة مُحدَّدة سلفاً (والرحلة المختارة إن
 * كانت بحثاً عن طيران) — بدل تركه يبحث بنفسه عن زر "طلب جديد" ويكرر
 * البحث عن نفس الرحلة من الصفر.
 */
export function BookNowLink({ className, children, category, serviceId, flightOffer }: BookNowLinkProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Link to="/register" className={className}>
        {children}
      </Link>
    );
  }

  const state: BookNowNavigationState = { openNewOrder: true, category, serviceId, flightOffer };
  return (
    <Link to="/dashboard/orders" state={state} className={className}>
      {children}
    </Link>
  );
}
