// File: frontend/src/features/services/ServicesTable.tsx

import { ClipboardList, Percent, Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { FilterPill } from "@/components/ui/FilterPill";
import { useAuth } from "@/features/auth/useAuth";
import { serviceCategoryLabels } from "@/lib/serviceCategoryLabels";
import type { ServiceOut } from "@/types/service";

interface ServicesTableProps {
  services: ServiceOut[];
  onEdit: (service: ServiceOut) => void;
  onManageRequirements: (service: ServiceOut) => void;
  onSetDiscount: (service: ServiceOut) => void;
  onDelete: (service: ServiceOut) => void;
}

/**
 * جدول تفاعلي لكتالوج الخدمات، مع فلترة حسب التصنيف وأزرار تعديل/خصم/حذف
 * لكل صف. زرا الخصم والحذف يظهران لحساب admin فقط (يطابق قيود الـ
 * backend: هذان الإجراءان محصوران بـ require_admin).
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
    <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterPill label="الكل" isActive={activeFilter === null} onClick={() => setActiveFilter(null)} />
        {Object.entries(serviceCategoryLabels).map(([value, label]) => (
          <FilterPill key={value} label={label} isActive={activeFilter === value} onClick={() => setActiveFilter(value)} />
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 text-xs text-slate-500">
              <th className="px-3 py-2 font-medium">الخدمة</th>
              <th className="px-3 py-2 font-medium">التصنيف</th>
              <th className="px-3 py-2 font-medium">السعر</th>
              <th className="px-3 py-2 font-medium">الحالة</th>
              <th className="px-3 py-2 font-medium"></th>
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
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      service.is_active
                        ? "border-navy-200 bg-navy-50 text-navy-700"
                        : "border-slate-200 bg-slate-100 text-slate-500"
                    }`}
                  >
                    {service.is_active ? "مفعَّلة" : "معطَّلة"}
                  </span>
                </td>
                <td className="px-3 py-3">
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
