// File: frontend/src/features/auth/ResetPasswordPage.tsx

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import { inputBaseClass } from "@/lib/designTokens";
import type { ResetPasswordRequest } from "@/types/user";

/** شاشة ضبط كلمة مرور جديدة عبر رابط استعادة موقّع (uid/expires/signature في الرابط). */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const uid = searchParams.get("uid");
  const expires = searchParams.get("expires");
  const signature = searchParams.get("signature");
  const hasValidLinkParams = Boolean(uid && expires && signature);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSucceeded, setHasSucceeded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload: ResetPasswordRequest = {
        uid: Number(uid),
        expires: Number(expires),
        signature: signature ?? "",
        new_password: newPassword,
      };
      await apiClient.post("/api/v1/auth/reset-password", payload);
      setHasSucceeded(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "تعذّر تحديث كلمة المرور"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="شعار وكالة برادايس" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-xl font-bold text-slate-900">ضبط كلمة مرور جديدة</h1>
        </div>

        {!hasValidLinkParams ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
            رابط استعادة كلمة المرور غير صالح. يرجى طلب رابط جديد.
          </p>
        ) : hasSucceeded ? (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            تم تحديث كلمة المرور بنجاح، سيتم تحويلك لتسجيل الدخول...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              type="password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="كلمة المرور الجديدة"
              className={`w-full ${inputBaseClass}`}
            />
            <input
              required
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="تأكيد كلمة المرور الجديدة"
              className={`w-full ${inputBaseClass}`}
            />

            {errorMessage && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 hover:shadow-lg
                active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "جارٍ التحديث..." : "تحديث كلمة المرور"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-navy-700 hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
