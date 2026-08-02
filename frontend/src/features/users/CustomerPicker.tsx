// File: frontend/src/features/users/CustomerPicker.tsx

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { useUsers } from "@/features/users/useUsers";
import { inputBaseClass } from "@/lib/designTokens";
import type { UserOut } from "@/types/user";

interface CustomerPickerProps {
  selectedCustomer: UserOut | null;
  onSelect: (customer: UserOut) => void;
}

/** قائمة بحث واختيار حساب عميل عادي مسجَّل مسبقاً، تُستخدَم قبل ترقيته لموظف/مدير/وكيل. */
export function CustomerPicker({ selectedCustomer, onSelect }: CustomerPickerProps) {
  const { users, isLoading } = useUsers("customer");
  const [searchText, setSearchText] = useState("");

  const filteredCustomers = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) return users;
    return users.filter(
      (user) =>
        user.full_name.toLowerCase().includes(search) ||
        (user.phone ?? "").includes(search) ||
        (user.email ?? "").toLowerCase().includes(search),
    );
  }, [users, searchText]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="ابحث عن العميل بالاسم أو الهاتف أو البريد..."
          className={`w-full pe-9 ${inputBaseClass}`}
        />
      </div>

      <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200/80">
        {isLoading && <p className="p-3 text-xs text-slate-400">جارٍ تحميل العملاء...</p>}
        {!isLoading && filteredCustomers.length === 0 && (
          <p className="p-3 text-xs text-slate-400">
            لا يوجد عملاء مطابقون — لازم يسجّل الشخص حساباً عادياً أولاً قبل ترقيته
          </p>
        )}
        {filteredCustomers.map((customer) => (
          <button
            key={customer.id}
            type="button"
            onClick={() => onSelect(customer)}
            className={`flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-3 py-2 text-start
              text-sm last:border-b-0 transition-colors ${
                selectedCustomer?.id === customer.id ? "bg-navy-50 text-navy-800" : "hover:bg-slate-50"
              }`}
          >
            <span className="font-medium">{customer.full_name}</span>
            <span className="text-xs text-slate-500">{customer.phone ?? customer.email ?? "—"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
