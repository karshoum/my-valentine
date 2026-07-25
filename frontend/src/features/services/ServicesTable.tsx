// File: frontend/src/features/services/ServicesTable.tsx

import { ClipboardList, Percent, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { useAuth } from "@/features/auth/useAuth";
import { serviceCategoryIcons } from "@/lib/serviceCategoryIcons";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceOut } from "@/types/service";

interface ServicesTableProps {
  services: ServiceOut[];
  onEdit: (service: ServiceOut) => void;
  onManageRequirements: (service: ServiceOut) => void;
  onSetDiscount: (service: ServiceOut) => void;
  onDelete: (service: ServiceOut) => void;
}

/** شارة حالة التفعيل، مشتركة بين عرضَي الجدول والبطاقات. */
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isActive ? "border-navy-200 bg-navy-50 text-navy-700" : "border-slate-200 bg-slate-100 text-slate-500"
      }`}
    >
      {isActive ? "مفعَّلة" : "معطَّلة"}
    </span>
  );
}

/**
 * كتالوج الخدمات، مع فلترة حسب التصنيف وأزرار تعديل/خصم/حذف لكل صف. زرا
 * الخصم والحذف يظهران لحساب admin فقط (يطابق قيود الـ backend). يُعرَض
 * كبطاقات واضحة على الهاتف (بدل جدول يتكسّر ويصعب قراءته على شاشة
 * ضيقة) وكجدول تقليدي من شاشة md فأكبر.
 */
export function ServicesTable({ services, onEdit, onManageRequirements, onSetDiscount, onDelete }: ServicesTableProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredServices = useMemo(
    () => (activeFilter ? services.filter((service) => service.category === activeFilter) : services),
    [services, activeFilter],
  );

  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-3 shadow-sm backdrop-blur-md sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill label="الكل" isActive={activeFilter === null} onClick={() => setActiveFilter(null)} />
        {Object.entries(serviceCategoryLabels).map(([value, label]) => (
          <FilterPill key={value} label={label} isActive={activeFilter === value} onClick={() => setActiveFilter(value)} />
        ))}
      </div>

      {/* عرض البطاقات — الهاتف والأجهزة اللوحية الصغيرة */}
      <div className="space-y-3 md:hidden">
        {filteredServices.map((service) => {
          const CategoryIcon = serviceCategoryIcons[service.category];
          return (
            <div key={service.id} className="rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                    <CategoryIcon size={18} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-slate-900">{service.title}</h3>
                    <p className="text-xs text-slate-500">{serviceCategoryLabels[service.category]}</p>
                  </div>
                </div>
                <StatusBadge isActive={service.is_active} />
              </div>

              <div className="mb-3 flex items-center gap-1.5 text-sm">
                {service.has_active_discount ? (
                  <>
                    <span className="text-slate-400 line-through">${service.base_price_usd}</span>
                    <span className="font-semibold text-navy-700">${service.effective_price_usd}</span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                      %{service.discount_percentage} خصم
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-navy-700">${service.base_price_usd}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => onEdit(service)}
                  className="flex items-center gap-1 rounded-lg bg-navy-50 px-2.5 py-1.5 text-xs font-medium
                    text-navy-700 transition-colors hover:bg-navy-100"
                >
                  <Pencil size={13} />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => onManageRequirements(service)}
                  className="flex items-center gap-1 rounded-lg bg-sky-50 px-2.5 py-1.5 text-xs font-medium
                    text-sky-700 transition-colors hover:bg-sky-100"
                >
                  <ClipboardList size={13} />
                  المستندات
                </button>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => onSetDiscount(service)}
                      className="flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-medium
                        text-violet-700 transition-colors hover:bg-violet-100"
                    >
                      <Percent size={13} />
                      خصم
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(service)}
                      className="flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-medium
                        text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      <Trash2 size={13} />
                      حذف
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filteredServices.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">لا توجد خدمات مطابقة</p>
        )}
      </div>

      {/* عرض الجدول — من شاشة md فأكبر */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-xs text-slate-500">
              <th className="px-3 py-2 font-medium">الخدمة</th>
              <th className="px-3 py-2 font-medium">التصنيف</th>
              <th className="px-3 py-2 font-medium">السعر</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="sticky end-0 bg-white px-3 py-2 font-medium shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]"></th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service) => (
              <tr key={service.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                <td className="px-3 py-3 font-medium text-slate-800">{service.title}</td>
                <td className="px-3 py-3 text-slate-600">{serviceCategoryLabels[service.category]}</td>
                <td className="px-3 py-3 text-slate-600">
                  {service.has_active_discount ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 line-through">${service.base_price_usd}</span>
                      <span className="font-semibold text-navy-700">${service.effective_price_usd}</span>
                      <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">
                        %{service.discount_percentage} خصم
                      </span>
                    </span>
                  ) : (
                    <>${service.base_price_usd}</>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge isActive={service.is_active} />
                </td>
                <td className="sticky end-0 bg-white px-3 py-3 shadow-[-4px_0_6px_-4px_rgba(0,0,0,0.15)]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(service)}
                      title="تعديل"
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-navy-50 hover:text-navy-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onManageRequirements(service)}
                      title="متطلبات المستندات"
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-sky-50 hover:text-sky-700"
                    >
                      <ClipboardList size={15} />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={() => onSetDiscount(service)}
                          title="عرض خصم"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Percent size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(service)}
                          title="حذف"
                          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                  لا توجد خدمات مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
