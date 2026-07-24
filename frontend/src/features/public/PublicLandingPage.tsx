// File: frontend/src/features/public/PublicLandingPage.tsx

import { ChevronLeft, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { PublicFlightSearch } from "@/features/public/PublicFlightSearch";
import { PublicServiceCards } from "@/features/public/PublicServiceCards";
import { PublicShipBooking } from "@/features/public/PublicShipBooking";
import { usePublicServices } from "@/features/public/usePublicServices";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceCategory } from "@/types/enums";

const INTERACTIVE_CATEGORIES: ServiceCategory[] = ["flight", "ship_ticket"];

const CATEGORY_LIST: { value: ServiceCategory; label: string; icon: string }[] = [
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
];

/** الصفحة الرئيسية العامة: قائمة تصنيفات يميناً + محتوى تفاعلي بالوسط. */
export function PublicLandingPage() {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("flight");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isInteractive = INTERACTIVE_CATEGORIES.includes(activeCategory);
  const { services, isLoading, error } = usePublicServices(isInteractive ? null : activeCategory);

  const filteredServices = isInteractive ? [] : services;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-200/60">
      {/* Header */}
      <header className="border-b border-white/30 bg-white/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-white/60 md:hidden"
            >
              <Menu size={20} />
            </button>
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
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-0 md:gap-5 px-4 py-5 sm:px-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-56 shrink-0 md:block">
          <SidebarContent
            activeCategory={activeCategory}
            onSelect={(cat) => setActiveCategory(cat)}
          />
        </aside>

        {/* Sidebar - Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute inset-y-0 end-0 w-64 overflow-y-auto bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">التصنيفات</span>
                <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                activeCategory={activeCategory}
                onSelect={(cat) => {
                  setActiveCategory(cat);
                  setSidebarOpen(false);
                }}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Category header */}
          <div className="mb-4 flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              {serviceCategoryLabels[activeCategory]}
            </h1>
            <span className="text-2xl">
              {CATEGORY_LIST.find((c) => c.value === activeCategory)?.icon}
            </span>
          </div>

          {/* Interactive panels for flight/ship */}
          {activeCategory === "flight" && <PublicFlightSearch />}
          {activeCategory === "ship_ticket" && <PublicShipBooking />}

          {/* Service cards for other categories */}
          {!isInteractive && (
            <>
              {isLoading && <p className="py-8 text-center text-sm text-slate-500">جارٍ تحميل الخدمات...</p>}
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
    </div>
  );
}

/** محتوى القائمة الجانبية (مشترك بين الحاسوب والهاتف). */
function SidebarContent({
  activeCategory,
  onSelect,
}: {
  activeCategory: ServiceCategory;
  onSelect: (cat: ServiceCategory) => void;
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
