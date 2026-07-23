// File: frontend/src/components/layout/Topbar.tsx

import { LogOut } from "lucide-react";

import { useAuth } from "@/features/auth/useAuth";
import { roleLabels } from "@/lib/roleLabels";

/** الشريط العلوي: اسم المستخدم الحالي ودوره، وزر تسجيل الخروج. */
export function Topbar() {
  const { fullName, role, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-white/20 bg-white/70 px-6 py-4 backdrop-blur-md">
      <div>
        <p className="text-sm font-semibold text-slate-800">{fullName}</p>
        {role && <p className="text-xs text-slate-500">{roleLabels[role]}</p>}
      </div>

      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500
          transition-all duration-300 hover:scale-[1.02] hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
      >
        <LogOut size={16} />
        تسجيل الخروج
      </button>
    </header>
  );
}
