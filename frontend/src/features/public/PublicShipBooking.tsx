// File: frontend/src/features/public/PublicShipBooking.tsx

import { Anchor, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useCurrency } from "@/features/public/useCurrency";
import { usePublicShipRoutes } from "@/features/public/usePublicShipRoutes";
import { useShipRouteQuote } from "@/features/public/useShipRouteQuote";
import { glassPanelClass, inputBaseClass } from "@/lib/designTokens";

/** قسم حجز تذاكر البواخر: خطوط مُعدّة من المدير + سعر مُحتسَب من الخادم (السعر الحقيقي + رسم الحجز بعد أي خصم). */
export function PublicShipBooking() {
  const { routes, isLoading, error } = usePublicShipRoutes();
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const selectedRoute = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) ?? null,
    [routes, selectedRouteId],
  );
  const { quote } = useShipRouteQuote(selectedRouteId, adults, children, infants);
  const { formatUsd } = useCurrency();

  const hasPricing = selectedRoute && Number(selectedRoute.adult_price_usd) > 0;

  return (
    <div className="space-y-4">
      <div className={`${glassPanelClass} p-4 sm:p-5`}>
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          <Anchor size={20} className="ms-1 inline text-navy-600" />
          حجز تذاكر البواخر
        </h2>

        {isLoading && <p className="text-sm text-slate-500">جارٍ تحميل الخطوط...</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!isLoading && routes.length === 0 && (
          <p className="text-sm text-slate-500">لا توجد خطوط بواخر متاحة حالياً</p>
        )}

        {routes.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-500">اختر الخط</label>
              <select
                value={selectedRouteId ?? ""}
                onChange={(e) => setSelectedRouteId(e.target.value ? Number(e.target.value) : null)}
                className={`w-full ${inputBaseClass}`}
              >
                <option value="">— اختر خط الرحلة —</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.origin_city} → {route.destination_city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">
                <Users size={13} className="ms-1 inline" />
                بالغين
              </label>
              <input type="number" min={1} max={20} value={adults} onChange={(e) => setAdults(Number(e.target.value) || 1)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">أطفال</label>
              <input type="number" min={0} max={20} value={children} onChange={(e) => setChildren(Number(e.target.value) || 0)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">رضّع</label>
              <input type="number" min={0} max={20} value={infants} onChange={(e) => setInfants(Number(e.target.value) || 0)} className={`w-full ${inputBaseClass}`} />
            </div>
          </div>
        )}

        {selectedRoute && (
          <div className="mt-4 rounded-xl border border-navy-100 bg-navy-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Anchor size={16} className="text-navy-600" />
              <span className="font-bold text-slate-900">
                {selectedRoute.origin_city} → {selectedRoute.destination_city}
              </span>
            </div>

            {hasPricing ? (
              <>
                <div className="mb-3 space-y-1 text-sm text-slate-600">
                  <p>سعر البالغ: <span className="font-semibold text-slate-900">{formatUsd(selectedRoute.adult_price_usd)}</span></p>
                  {Number(selectedRoute.child_price_usd) > 0 && (
                    <p>سعر الطفل: <span className="font-semibold text-slate-900">{formatUsd(selectedRoute.child_price_usd)}</span></p>
                  )}
                  {Number(selectedRoute.infant_price_usd) > 0 && (
                    <p>سعر الرضيع: <span className="font-semibold text-slate-900">{formatUsd(selectedRoute.infant_price_usd)}</span></p>
                  )}
                </div>
                {quote && Number(quote.fee_amount_usd) > 0 && (
                  <div className="mb-2 text-xs text-slate-500">
                    <span>رسم الحجز: </span>
                    {quote.discount_percentage ? (
                      <>
                        <span className="line-through">{formatUsd(quote.fee_amount_usd)}</span>{" "}
                        <span className="font-semibold text-navy-700">{formatUsd(quote.fee_after_discount_usd)}</span>{" "}
                        <span className="text-gold-700">(خصم {quote.discount_percentage}%)</span>
                      </>
                    ) : (
                      <span className="font-semibold text-slate-700">{formatUsd(quote.fee_amount_usd)}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-navy-700">
                    الإجمالي: {quote ? formatUsd(quote.total_price_usd) : "..."}
                  </p>
                  <Link
                    to="/register"
                    className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white
                      shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500"
                  >
                    احجز الآن
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gold-700">الأسعار ستُحدَّث قريباً</p>
                <Link
                  to="/register"
                  className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white
                    shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500"
                >
                  سجّل واحجز
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
