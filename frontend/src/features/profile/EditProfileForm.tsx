// File: frontend/src/features/profile/EditProfileForm.tsx

import { useState } from "react";

import { PhoneNumberInput } from "@/components/ui/PhoneNumberInput";
import { useUpdateProfile } from "@/features/profile/useUpdateProfile";
import { inputBaseClass } from "@/lib/designTokens";
import type { UserOut } from "@/types/user";

interface EditProfileFormProps {
  profile: UserOut;
  onUpdated: (profile: UserOut) => void;
}

/** نموذج تعديل بيانات الحساب الشخصية: الاسم الكامل، البريد الإلكتروني، ورقم واتساب للتواصل. */
export function EditProfileForm({ profile, onUpdated }: EditProfileFormProps) {
  const { updateProfile, isSubmitting, error } = useUpdateProfile();
  const [fullName, setFullName] = useState(profile.full_name);
  const [email, setEmail] = useState(profile.email ?? "");
  const [whatsappNumber, setWhatsappNumber] = useState(profile.whatsapp_number ?? "");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = fullName.trim().length >= 2;

  const handleSubmit = async () => {
    setSuccessMessage(null);
    const updated = await updateProfile({
      full_name: fullName.trim(),
      email: email.trim() || null,
      whatsapp_number: whatsappNumber.trim() || null,
    });
    if (updated) {
      onUpdated(updated);
      setSuccessMessage("تم تحديث بياناتك بنجاح");
    }
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="mb-4 text-sm font-bold text-slate-900">تعديل البيانات الشخصية</h3>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">الاسم الكامل</label>
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className={`w-full ${inputBaseClass}`}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">البريد الإلكتروني</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@example.com"
            className={`w-full ${inputBaseClass}`}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">رقم واتساب للتواصل</label>
          <PhoneNumberInput value={whatsappNumber} onChange={setWhatsappNumber} placeholder="5xxxxxxxx" />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}
        {successMessage && <p className="text-xs text-navy-600">{successMessage}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="rounded-xl bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
}
