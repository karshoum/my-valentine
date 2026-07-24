// File: frontend/src/features/profile/DeactivateAccountSection.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/useAuth";
import { useDeactivateAccount } from "@/features/profile/useDeactivateAccount";
import { inputBaseClass } from "@/lib/designTokens";

/**
 * قسم إيقاف الحساب الذاتي ("حذف الحساب"): يوقف الحساب فعلياً ويمنعه من
 * تسجيل الدخول مجدداً، دون حذف سجل طلباته ومدفوعاته من قاعدة البيانات
 * (حفاظاً على السجل المالي). يتطلب تأكيد كلمة المرور الحالية.
 */
export function DeactivateAccountSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { deactivateAccount, isSubmitting, error } = useDeactivateAccount();
  const [password, setPassword] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleConfirmDeactivation = async () => {
    const succeeded = await deactivateAccount({ password });
    if (succeeded) {
      logout();
      navigate("/services/flight", { replace: true });
    }
  };

  return (
    <div className="rounded-2xl border border-rose-200/70 bg-rose-50/40 p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-bold text-rose-800">إيقاف الحساب</h3>
      <p className="mb-4 text-xs text-rose-700">
        سيتم إيقاف حسابك ولن تتمكّن من تسجيل الدخول مرة أخرى، مع الاحتفاظ بسجل طلباتك ومدفوعاتك السابقة. للتراجع
        عن هذا لاحقاً، يرجى التواصل مع الإدارة.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          placeholder="كلمة المرور الحالية للتأكيد"
          className={`w-full max-w-xs ${inputBaseClass}`}
        />
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={password.length === 0}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          إيقاف الحساب
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}

      {isConfirmOpen && (
        <ConfirmDialog
          title="تأكيد إيقاف الحساب"
          message="هل أنت متأكد تماماً من إيقاف حسابك؟ لن تتمكّن من تسجيل الدخول بعد ذلك إلا بالتواصل مع الإدارة."
          confirmLabel="إيقاف حسابي"
          isConfirming={isSubmitting}
          onConfirm={handleConfirmDeactivation}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
}
