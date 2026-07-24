// File: frontend/src/features/public/PublicLandingPage.tsx

import { PlaneTakeoff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { usePublicServices } from "@/features/public/usePublicServices";
import { glassPanelClass, cardHoverClass } from "@/lib/designTokens";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceCategory } from "@/types/enums";

/** الخدمات ذات بحث/حجز تفاعلي حقيقي (يتطلب حساباً) بدل السعر الثابت. */
const LIVE_SEARCH_CATEGORIES: ServiceCategory[] = ["flight"];

const CATEGORY_FILTERS: { value: ServiceCategory | null; label: string }[] = [
  { value: null, label: "الكل" },
  ...(Object.entries(serviceCategoryLabels) as [ServiceCategory, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

/** الصفحة الرئيسية العامة للزوار: كتالوج الخدمات المفعَّلة + دخول/تسجيل جديد. */
export function PublicLandingPage() {
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const { services, isLoading, error } = usePublicServices(category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-200/60">
      <header className="mx-auto flex max-w-6xl items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="شعار وكالة برادايس" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
          <span className="text-lg font-bold text-slate-900">وكالة برادايس</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-navy-700 transition-colors hover:bg-white/60"
          >
            تسجيل الدخول
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white shadow-sm
              transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 active:scale-[0.98]"
          >
            إنشاء حساب
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            منصة رقمية متكاملة لخدمات السفر والسياحة وخدمات الأعمال
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            تذاكر طيران، تأشيرات، إقامات، تخليص إجراءات، وأكثر — كل خدمات الوكالة في مكان واحد
          </p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value ?? "all"}
              type="button"
              onClick={() => setCategory(filter.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-300 ${
                category === filter.value
                  ? "bg-navy-600 text-white"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:bg-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading && <p className="text-center text-sm text-slate-500">جارٍ تحميل الخدمات...</p>}

        {error && (
          <p className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
            {error}
          </p>
        )}

        {!isLoading && !error && services.length === 0 && (
          <p className="text-center text-sm text-slate-500">لا توجد خدمات في هذا التصنيف حالياً</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const hasRealPrice = Number(service.effective_price_usd) > 0;
            const hasLiveSearch = LIVE_SEARCH_CATEGORIES.includes(service.category);
            return (
              <div key={service.id} className={`${glassPanelClass} ${cardHoverClass} flex flex-col p-5`}>
                <span className="mb-2 inline-block w-fit rounded-full bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-700">
                  {serviceCategoryLabels[service.category]}
                </span>
                <h3 className="mb-1 text-base font-bold text-slate-900">{service.title}</h3>
                {service.description && <p className="mb-3 text-sm text-slate-600">{service.description}</p>}

                {service.requirements.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">المستندات المطلوبة:</p>
                    <ul className="space-y-0.5 text-xs text-slate-600">
                      {service.requirements
                        .slice()
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((requirement) => (
                          <li key={requirement.id} className="flex gap-1.5">
                            <span className="text-navy-400">•</span>
                            {requirement.requirement_text}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="mt-auto pt-1">
                  {hasLiveSearch ? (
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-navy-600 px-3.5 py-2 text-sm
                        font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500"
                    >
                      <PlaneTakeoff size={15} />
                      ابحث واحجز رحلتك الآن
                    </Link>
                  ) : hasRealPrice ? (
                    <p className="text-sm font-semibold text-navy-700">
                      {service.has_active_discount && (
                        <span className="ms-2 text-xs font-normal text-slate-400 line-through">
                          ${service.base_price_usd}
                        </span>
                      )}
                      ${service.effective_price_usd}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold text-gold-700">تواصل معنا للسعر</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
