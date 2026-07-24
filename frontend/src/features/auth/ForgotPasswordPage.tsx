// File: frontend/src/features/auth/ForgotPasswordPage.tsx

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import { inputBaseClass } from "@/lib/designTokens";
import type { ForgotPasswordRequest } from "@/types/user";

/** شاشة طلب استعادة كلمة المرور: تُدخِل الهوية (بريد/هاتف) وتُرسِل رابط استعادة إن وُجد حساب مطابق. */
export function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload: ForgotPasswordRequest = { identifier: identifier.trim() };
      const response = await apiClient.post<{ detail: string }>("/api/v1/auth/forgot-password", payload);
      setResultMessage(response.data.detail);
    } catch (err) {
      setErrorMessage(extractErrorMessage(err, "تعذّر إرسال طلب الاستعادة"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="شعار وكالة برادايس" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-xl font-bold text-slate-900">استعادة كلمة المرور</h1>
          <p className="mt-1 text-sm text-slate-500">أدخل بريدك الإلكتروني أو رقم هاتفك المسجَّل</p>
        </div>

        {resultMessage ? (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm text-green-700">
            {resultMessage}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="البريد الإلكتروني أو رقم الهاتف"
              className={`w-full ${inputBaseClass}`}
            />

            {errorMessage && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || identifier.trim().length < 3}
              className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 hover:shadow-lg
                active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-slate-500">
          تذكّرت كلمة المرور؟{" "}
          <Link to="/login" className="font-semibold text-navy-700 hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
