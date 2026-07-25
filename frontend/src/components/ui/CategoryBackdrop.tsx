// File: frontend/src/components/ui/CategoryBackdrop.tsx

import type { LucideIcon } from "lucide-react";

interface CategoryBackdropProps {
  icon: LucideIcon;
  /** يُفعّل خط مسار منقّط بنقاط توقّف، مناسب لتصنيفات الرحلات (طيران/بواخر/سياحة). */
  showRoute?: boolean;
}

/**
 * خلفية زخرفية خلف أقسام الحجز/الخدمات العامة: أيقونة كبيرة شبه شفافة
 * تمثّل تصنيف الخدمة الحالي في الزاوية، مع خط مسار منقّط اختياري
 * لتصنيفات الرحلات — بألوان الهوية البصرية (كحلي/ذهبي) فوق التدرّج
 * الكريمي الأساسي للمنصة، بلا أي صور خارجية. تظهر بوضوح فوق التدرّج
 * وتُشعّ بلطف عبر الألواح الزجاجية شبه الشفافة فوقها.
 */
export function CategoryBackdrop({ icon: Icon, showRoute = false }: CategoryBackdropProps) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <Icon
        className="absolute -end-6 -top-6 -rotate-6 text-navy-900/[0.13] sm:-end-2 sm:-top-8"
        size={240}
        strokeWidth={1.1}
      />
      {showRoute && (
        <svg
          className="absolute inset-x-0 top-24 w-full text-gold-500/40 sm:top-28"
          viewBox="0 0 400 70"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M -10 55 Q 120 5 200 35 T 410 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="7 9"
            strokeLinecap="round"
          />
          <circle cx="-10" cy="55" r="4.5" fill="currentColor" />
          <circle cx="200" cy="35" r="4.5" fill="currentColor" />
          <circle cx="410" cy="10" r="4.5" fill="currentColor" />
        </svg>
      )}
    </div>
  );
}
