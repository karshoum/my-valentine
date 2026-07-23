// File: frontend/src/features/profile/ChangePasswordForm.tsx

import { useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { useChangePassword } from "@/features/profile/useChangePassword";

/** نموذج تغيير كلمة المرور الذاتي، يتطلب التحقق من كلمة المرور الحالية. */
export function ChangePasswordForm() {
  const { changePassword, isSubmitting, error, successMessage } = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setValidationError(null);

    if (newPassword.length < 8) {
      setValidationError("كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("كلمتا المرور الجديدتان غير متطابقتين");
      return;
    }

    const succeeded = await changePassword({ current_password: currentPassword, new_password: newPassword });
    if (succeeded) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="mb-4 text-sm font-bold text-slate-900">تغيير كلمة المرور</h3>

      <div className="space-y-3">
        <input
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          type="password"
          placeholder="كلمة المرور الحالية"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          type="password"
          placeholder="كلمة المرور الجديدة"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          placeholder="تأكيد كلمة المرور الجديدة"
          className={`w-full ${inputBaseClass}`}
        />

        {validationError && <p className="text-xs text-rose-600">{validationError}</p>}
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {successMessage && <p className="text-xs text-navy-600">{successMessage}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
          className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ التحديث..." : "تغيير كلمة المرور"}
        </button>
      </div>
    </div>
  );
}
