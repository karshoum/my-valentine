// File: frontend/src/features/users/CreateStaffModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCreateStaff } from "@/features/users/useCreateStaff";
import { inputBaseClass } from "@/lib/designTokens";
import type { UserRole } from "@/types/enums";
import type { UserOut } from "@/types/user";

interface CreateStaffModalProps {
  onClose: () => void;
  onCreated: (user: UserOut) => void;
}

/** نموذج إنشاء حساب موظف أو مدير جديد (admin فقط). */
export function CreateStaffModal({ onClose, onCreated }: CreateStaffModalProps) {
  const { createStaff, isSubmitting, error } = useCreateStaff();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Extract<UserRole, "admin" | "employee">>("employee");

  const canSubmit = fullName.trim().length >= 2 && phone.trim().length >= 6 && password.length >= 8;

  const handleSubmit = async () => {
    const user = await createStaff({
      full_name: fullName.trim(),
      email: email.trim() || null,
      phone: phone.trim(),
      password,
      role,
    });
    if (user) onCreated(user);
  };

  return (
    <Modal title="إضافة موظف أو مدير جديد" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="الاسم الكامل"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="رقم الهاتف"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="البريد الإلكتروني (اختياري)"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="كلمة المرور"
          className={`w-full ${inputBaseClass}`}
        />

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
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </button>
      </div>
    </Modal>
  );
}
