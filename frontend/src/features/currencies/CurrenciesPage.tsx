// File: frontend/src/features/currencies/CurrenciesPage.tsx

import { Plus } from "lucide-react";
import { useState } from "react";

import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { CreateCurrencyModal } from "@/features/currencies/CreateCurrencyModal";
import { CurrenciesTable } from "@/features/currencies/CurrenciesTable";
import { UpdateRateModal } from "@/features/currencies/UpdateRateModal";
import { useCurrencies } from "@/features/currencies/useCurrencies";
import type { CurrencyOut } from "@/types/currency";

/** الشاشة التفصيلية للعملات: عرض الأسعار الحالية، والتحديث اليدوي الحصري لسعر الصرف (admin فقط). */
export function CurrenciesPage() {
  const { currencies, isLoading, error, refetch } = useCurrencies();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOut | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل العملات..." />;
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">العملات وسعر الصرف</h1>
          <p className="text-sm text-slate-500">
            التحكم اليدوي الحصري بأسعار الصرف — لا يوجد أي مصدر آلي خارجي لتحديث هذه الأسعار
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white
            transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
        >
          <Plus size={16} />
          إضافة عملة
        </button>
      </div>

      <CurrenciesTable currencies={currencies} onSelectCurrency={setSelectedCurrency} />

      {selectedCurrency && (
        <UpdateRateModal
          currency={selectedCurrency}
          onClose={() => setSelectedCurrency(null)}
          onUpdated={() => {
            setSelectedCurrency(null);
            refetch();
          }}
        />
      )}

      {isCreateModalOpen && (
        <CreateCurrencyModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
