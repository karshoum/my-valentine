// File: frontend/src/features/auth/LoginPage.tsx

import { LockKeyhole, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { useAuth } from "@/features/auth/useAuth";
import { inputBaseClass } from "@/lib/designTokens";

/** شاشة تسجيل الدخول لكل أنواع المستخدمين (عميل، وكيل، موظف، مدير). */
export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
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
      await login({ identifier, password });
      navigate("/dashboard", { replace: true });
    } catch {
      setErrorMessage("بيانات الدخول غير صحيحة، حاول مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 to-cream-200/60 p-4">
      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/70 p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="شعار وكالة برادايس" className="mx-auto mb-4 h-20 w-20 rounded-2xl object-cover shadow-sm" />
          <h1 className="text-xl font-bold text-slate-900">وكالة برادايس</h1>
          <p className="mt-1 text-sm text-slate-500">سجّل دخولك للمتابعة إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">البريد الإلكتروني أو الهاتف</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="09xxxxxxxx أو name@example.com"
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
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${inputBaseClass} w-full pe-11`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}

          <div className="text-end">
            <Link to="/forgot-password" className="text-xs font-medium text-navy-600 hover:underline">
              هل نسيت كلمة المرور؟
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm
              transition-all duration-300 hover:scale-[1.02] hover:bg-navy-500 hover:shadow-lg
              active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <div className="mt-5">
          <GoogleSignInButton
            onError={setErrorMessage}
            onSuccess={() => navigate("/dashboard", { replace: true })}
          />
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          ليس لديك حساب؟{" "}
          <Link to="/register" className="font-semibold text-navy-700 hover:underline">
            أنشئ حساباً جديداً
          </Link>
        </p>
      </div>
    </div>
  );
}
