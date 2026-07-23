// File: frontend/src/lib/designTokens.ts

/**
 * فئات Tailwind جاهزة لإعادة الاستخدام حسب دليل التصميم
 * (docs/UI_DESIGN_GUIDELINES.md) — لتفادي تكرارها في كل مكوّن.
 */
export const glassPanelClass =
  "backdrop-blur-md bg-white/70 border border-white/20 rounded-2xl shadow-sm";

export const cardHoverClass =
  "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5";

export const interactiveScaleClass =
  "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]";

export const inputBaseClass =
  "rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 " +
  "placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 " +
  "focus:ring-emerald-500/20 transition-all";

/** خرائط ألوان لكل حالة طلب (مطابقة لـ app.models.enums.OrderStatus)، تُستخدم في الشارات النابضة والجداول. */
export const orderStatusColorMap: Record<string, { dot: string; badge: string; label: string }> = {
  pending: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "قيد الانتظار" },
  processing: { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700 border-violet-200", label: "قيد المعالجة" },
  in_system: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "في السيستم" },
  completed: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "مكتمل" },
  rejected: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600 border-slate-200", label: "مرفوض" },
  refunded: { dot: "bg-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200", label: "مسترجَع" },
};

/** لون لكنة موحّد لكل قسم رئيسي في المنصة (B2C مقابل B2B). */
export const sectionAccent = {
  finance: "emerald",
  agents: "violet",
} as const;
