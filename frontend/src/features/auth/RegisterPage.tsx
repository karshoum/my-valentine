// File: frontend/src/features/auth/RegisterPage.tsx

import { LockKeyhole, Mail, Phone, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";
import { apiClient } from "@/lib/apiClient";
import { inputBaseClass } from "@/lib/designTokens";
import type { RegisterRequest } from "@/types/user";

/** شاشة إنشاء حساب عميل جديد (B2C)، يليها تسجيل دخول تلقائي. */
export function RegisterPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload: RegisterRequest = { full_name: fullName, email: email || null, phone, password };
      await apiClient.post("/api/v1/auth/register", payload);
      await login({ identifier: phone, password });
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage("تعذّر إنشاء الحساب — تأكد أن رقم الهاتف أو البريد غير مستخدم من قبل");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="شعار وكالة برادايس" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-xl font-bold text-slate-900">إنشاء حساب جديد</h1>
          <p className="mt-1 text-sm text-slate-500">وكالة برادايس للسفر والسياحة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">الاسم الكامل</label>
            <div className="relative">
              <User className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                minLength={2}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="الاسم الثلاثي"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">رقم الهاتف</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                minLength={6}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="09xxxxxxxx"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">البريد الإلكتروني (اختياري)</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">كلمة المرور</label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="8 أحرف على الأقل"
              />
            </div>
          </div>

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
            {isSubmitting ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          عندك حساب بالفعل؟{" "}
          <Link to="/login" className="font-semibold text-navy-700 hover:underline">
            سجّل دخولك
          </Link>
        </p>
      </div>
    </div>
  );
}
