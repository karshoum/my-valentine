// File: frontend/src/features/public/PublicOfficesSection.tsx

import { MapPin } from "lucide-react";

import { usePublicOffices } from "@/features/offices/usePublicOffices";

/** قسم "مكاتبنا": عناوين مكاتب/فروع الوكالة المُفعَّلة، يظهر لكل زوّار الصفحة العامة. */
export function PublicOfficesSection() {
  const { offices, isLoading } = usePublicOffices();

  if (isLoading || offices.length === 0) return null;

  return (
    <div className="border-t border-white/30 bg-white/40 px-4 py-5 backdrop-blur-sm sm:px-6">
      <h3 className="mb-3 text-center text-sm font-bold text-slate-800">مكاتبنا</h3>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {offices.map((office) => (
          <div
            key={office.id}
            className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white/70 p-3 text-start"
          >
            <MapPin size={16} className="mt-0.5 shrink-0 text-navy-500" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{office.country}</p>
              <p className="text-xs text-slate-500">{office.address_line}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
