// File: frontend/src/features/public/PublicLandingPage.tsx

import { ChevronLeft, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";

import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useAuth } from "@/features/auth/useAuth";
import { ComingSoonSection } from "@/features/public/ComingSoonSection";
import { CurrencyProvider } from "@/features/public/CurrencyContext";
import { CurrencySwitcher } from "@/features/public/CurrencySwitcher";
import { PublicFlightSearch } from "@/features/public/PublicFlightSearch";
import { PublicServiceCards } from "@/features/public/PublicServiceCards";
import { PublicShipBooking } from "@/features/public/PublicShipBooking";
import { PublicSocialLinksBar } from "@/features/public/PublicSocialLinksBar";
import { usePublicServices } from "@/features/public/usePublicServices";
import type { ServiceCategory } from "@/types/enums";

/** أي تصنيف تفاعلي تُبنى واجهته الخاصة (بحث/حجز) بدل بطاقات خدمة عامة. */
const INTERACTIVE_CATEGORIES: ServiceCategory[] = ["flight", "ship_ticket"];

/** تصنيف زائف إضافي لا يطابق ServiceCategory الخلفي: قسم "قريباً" لخدمات مستقبلية. */
const COMING_SOON = "coming_soon" as const;
export type PublicSection = ServiceCategory | typeof COMING_SOON;

const CATEGORY_LIST: { value: PublicSection; label: string; icon: string }[] = [
  { value: "flight", label: "تذاكر طيران", icon: "✈️" },
  { value: "ship_ticket", label: "تذاكر بواخر", icon: "🚢" },
  { value: "visa", label: "تأشيرات", icon: "📋" },
  { value: "residency", label: "إقامات عمل", icon: "🏢" },
  { value: "insurance", label: "تأمين طبي", icon: "🏥" },
  { value: "renewal_extension", label: "تجديد وتمديد", icon: "🔄" },
  { value: "security_approval", label: "موافقات أمنية", icon: "🔐" },
  { value: "procedure_package", label: "بكجات تخليص إجراءات", icon: "📦" },
  { value: "tourism_package", label: "بكجات سياحية", icon: "🌴" },
  { value: "document_extraction", label: "خدمات استخراج", icon: "📄" },
  { value: "attestation", label: "خدمات توثيق", icon: "✅" },
  { value: COMING_SOON, label: "قريباً", icon: "🚀" },
];

const VALID_SECTIONS = new Set(CATEGORY_LIST.map((item) => item.value));

/**
 * الصفحة الرئيسية العامة: قائمة تصنيفات يميناً + محتوى تفاعلي بالوسط.
 * كل تصنيف له مسار مستقل (/services/:category) بدل التبديل بحالة داخلية
 * فقط، حتى يمكن مشاركة رابط مباشر لأي قسم أو الرجوع إليه من سجل المتصفح.
 */
export function PublicLandingPage() {
  const { isAuthenticated } = useAuth();
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!category || !VALID_SECTIONS.has(category as PublicSection)) {
    return <Navigate to="/services/flight" replace />;
  }
  const activeCategory = category as PublicSection;

  const isInteractive = INTERACTIVE_CATEGORIES.includes(activeCategory as ServiceCategory);
  const isComingSoon = activeCategory === COMING_SOON;
  const { services, isLoading, error } = usePublicServices(
    isInteractive || isComingSoon ? null : (activeCategory as ServiceCategory),
  );

  const filteredServices = isInteractive || isComingSoon ? [] : services;

  const handleSelectSection = (section: PublicSection) => {
    navigate(`/services/${section}`);
    setSidebarOpen(false);
  };

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-200/60">
        {/* Header */}
        <header className="border-b border-white/30 bg-white/50 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-navy-700
                  transition-colors hover:bg-white/60 md:hidden"
              >
                <Menu size={18} />
                خدماتنا
              </button>
              <img
                src="/logo.png"
                alt="شعار وكالة برادايس"
                className="h-11 w-11 shrink-0 rounded-xl object-cover shadow-sm sm:h-12 sm:w-12"
              />
              <span className="truncate text-base font-bold text-slate-900 sm:text-lg">وكالة برادايس</span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:block">
                <CurrencySwitcher />
              </div>
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-2.5 py-2 text-sm font-semibold
                    text-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500
                    active:scale-[0.98] sm:px-4"
                >
                  <LayoutDashboard size={16} />
                  لوحة التحكم
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-2.5 py-2 text-sm font-semibold text-navy-700 transition-colors
                      hover:bg-white/60 sm:px-4"
                  >
                    <span className="sm:hidden">دخول</span>
                    <span className="hidden sm:inline">تسجيل الدخول</span>
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-navy-600 px-2.5 py-2 text-sm font-semibold text-white shadow-sm
                      transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 active:scale-[0.98] sm:px-4"
                  >
                    <span className="sm:hidden">حساب</span>
                    <span className="hidden sm:inline">إنشاء حساب</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-0 md:gap-5 px-4 py-5 sm:px-6">
          {/* Sidebar - Desktop */}
          <aside className="hidden w-56 shrink-0 md:block">
            <SidebarContent activeCategory={activeCategory} onSelect={handleSelectSection} />
          </aside>

          {/* Sidebar - Mobile drawer (يبقى في الشجرة دائماً لتفعيل انتقال الانزلاق، ويُخفى بـ pointer-events عند الإغلاق) */}
          <div
            className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}
            aria-hidden={!sidebarOpen}
          >
            <div
              className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={() => setSidebarOpen(false)}
            />
            <aside
              className={`absolute inset-y-0 start-0 w-72 max-w-[85vw] overflow-y-auto bg-white p-4 shadow-xl
                transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">خدماتنا</span>
                <div className="flex items-center gap-2">
                  <CurrencySwitcher />
                  <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <SidebarContent activeCategory={activeCategory} onSelect={handleSelectSection} />
            </aside>
          </div>

          {/* Main content */}
          <main className="min-w-0 flex-1">
            {/* Category header */}
            <div className="mb-4 flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                {CATEGORY_LIST.find((item) => item.value === activeCategory)?.label}
              </h1>
              <span className="text-2xl">
                {CATEGORY_LIST.find((item) => item.value === activeCategory)?.icon}
              </span>
            </div>

            {/* Interactive panels for flight/ship */}
            {activeCategory === "flight" && <PublicFlightSearch />}
            {activeCategory === "ship_ticket" && <PublicShipBooking />}

            {/* قسم الخدمات المستقبلية */}
            {isComingSoon && <ComingSoonSection />}

            {/* Service cards for other categories */}
            {!isInteractive && !isComingSoon && (
              <>
                {isLoading && <LoadingIndicator label="جارٍ تحميل الخدمات..." />}
                {error && (
                  <p className="mx-auto max-w-md rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm text-rose-700">
                    {error}
                  </p>
                )}
                {!isLoading && !error && <PublicServiceCards services={filteredServices} />}
              </>
            )}
          </main>
        </div>

        <PublicSocialLinksBar />
      </div>
    </CurrencyProvider>
  );
}

/** محتوى القائمة الجانبية (مشترك بين الحاسوب والهاتف). */
function SidebarContent({
  activeCategory,
  onSelect,
}: {
  activeCategory: PublicSection;
  onSelect: (section: PublicSection) => void;
}) {
  return (
    <nav className="space-y-1">
      {CATEGORY_LIST.map((item) => {
        const isActive = activeCategory === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onSelect(item.value)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200
              ${isActive
                ? "border border-gold-300/50 bg-navy-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-start">{item.label}</span>
            {isActive && <ChevronLeft size={14} className="opacity-60" />}
          </button>
        );
      })}
    </nav>
  );
}
