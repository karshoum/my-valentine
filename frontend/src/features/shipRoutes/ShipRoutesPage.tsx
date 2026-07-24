// File: frontend/src/features/shipRoutes/ShipRoutesPage.tsx

import { Anchor, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { apiClient } from "@/lib/apiClient";
import { glassPanelClass, inputBaseClass } from "@/lib/designTokens";
import type { ShipRouteOut } from "@/types/shipRoute";

/** شاشة إدارة خطوط البواخر (admin فقط): عرض + إضافة + حذف. */
export function ShipRoutesPage() {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [routes, setRoutes] = useState<ShipRouteOut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [originCity, setOriginCity] = useState("");
  const [destCity, setDestCity] = useState("");
  const [adultPrice, setAdultPrice] = useState("0");
  const [childPrice, setChildPrice] = useState("0");
  const [infantPrice, setInfantPrice] = useState("0");

  const fetchRoutes = () => {
    setIsLoading(true);
    apiClient
      .get<ShipRouteOut[]>("/api/v1/ship-routes/manage/all")
      .then((r) => setRoutes(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchRoutes(); }, []);

  const handleCreate = () => {
    apiClient
      .post("/api/v1/ship-routes/", {
        origin_city: originCity,
        destination_city: destCity,
        adult_price_usd: adultPrice,
        child_price_usd: childPrice,
        infant_price_usd: infantPrice,
      })
      .then(() => {
        fetchRoutes();
        setShowForm(false);
        setOriginCity("");
        setDestCity("");
        setAdultPrice("0");
        setChildPrice("0");
        setInfantPrice("0");
      })
      .catch(() => {});
  };

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الخط؟")) return;
    apiClient.delete(`/api/v1/ship-routes/${id}`).then(() => fetchRoutes());
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          <Anchor size={22} className="ms-2 inline text-navy-600" />
          خطوط البواخر
        </h1>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold
              text-white shadow-sm hover:bg-navy-500"
          >
            <Plus size={16} />
            إضافة خط
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className={`${glassPanelClass} mb-5 space-y-3 p-4`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">مدينة الانطلاق</label>
              <input value={originCity} onChange={(e) => setOriginCity(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">مدينة الوصول</label>
              <input value={destCity} onChange={(e) => setDestCity(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">سعر البالغ ($)</label>
              <input type="number" min={0} step="0.01" value={adultPrice} onChange={(e) => setAdultPrice(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">سعر الطفل ($)</label>
              <input type="number" min={0} step="0.01" value={childPrice} onChange={(e) => setChildPrice(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">سعر الرضيع ($)</label>
              <input type="number" min={0} step="0.01" value={infantPrice} onChange={(e) => setInfantPrice(e.target.value)} className={`w-full ${inputBaseClass}`} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!originCity.trim() || !destCity.trim()}
              className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-500 disabled:opacity-50"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-slate-500">جارٍ التحميل...</p>
      ) : routes.length === 0 ? (
        <p className="text-center text-sm text-slate-500">لا توجد خطوط بواخر بعد</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-500">
                <th className="px-3 py-2 text-start">الخط</th>
                <th className="px-3 py-2 text-start">بالغ</th>
                <th className="px-3 py-2 text-start">طفل</th>
                <th className="px-3 py-2 text-start">رضيع</th>
                <th className="px-3 py-2 text-start">الحالة</th>
                {isAdmin && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-slate-900">
                    {route.origin_city} → {route.destination_city}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">${route.adult_price_usd}</td>
                  <td className="px-3 py-2.5 text-slate-700">${route.child_price_usd}</td>
                  <td className="px-3 py-2.5 text-slate-700">${route.infant_price_usd}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${route.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {route.is_active ? "مفعَّل" : "معطَّل"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-3 py-2.5">
                      <button type="button" onClick={() => handleDelete(route.id)} className="rounded-lg p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
