// File: frontend/src/features/users/CreateStaffModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { CustomerPicker } from "@/features/users/CustomerPicker";
import { usePromoteToStaff } from "@/features/users/usePromoteToStaff";
import { inputBaseClass } from "@/lib/designTokens";
import type { UserRole } from "@/types/enums";
import type { UserOut } from "@/types/user";

interface CreateStaffModalProps {
  onClose: () => void;
  onCreated: (user: UserOut) => void;
}

/**
 * نموذج ترقية حساب عميل عادي مسجَّل مسبقاً إلى موظف أو مدير (admin فقط)
 * — يختار المدير الحساب من قائمة العملاء الموجودين بدل ملء بياناته
 * يدوياً؛ الشخص لازم يكون سجّل حسابه العادي بنفسه أولاً.
 */
export function CreateStaffModal({ onClose, onCreated }: CreateStaffModalProps) {
  const { promoteToStaff, isSubmitting, error } = usePromoteToStaff();
  const [selectedCustomer, setSelectedCustomer] = useState<UserOut | null>(null);
  const [role, setRole] = useState<Extract<UserRole, "admin" | "employee">>("employee");

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    const user = await promoteToStaff({ user_id: selectedCustomer.id, role });
    if (user) onCreated(user);
  };

  return (
    <Modal title="ترقية عميل إلى موظف أو مدير" onClose={onClose}>
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          اختر حساب عميل مسجَّل بالفعل من القائمة أدناه، ثم حدّد الدور الجديد له.
        </p>

        <CustomerPicker selectedCustomer={selectedCustomer} onSelect={setSelectedCustomer} />

        {selectedCustomer && (
          <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-3 text-sm text-navy-800">
            الحساب المختار: <span className="font-semibold">{selectedCustomer.full_name}</span>
          </div>
        )}

        <select
          value={role}
          onChange={(event) => setRole(event.target.value as "admin" | "employee")}
          className={`w-full ${inputBaseClass}`}
        >
          <option value="employee">موظف</option>
          <option value="admin">مدير</option>
        </select>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCustomer || isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الترقية..." : "ترقية الحساب"}
        </button>
      </div>
    </Modal>
  );
}
