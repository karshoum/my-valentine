// File: frontend/src/components/layout/Topbar.tsx

import { LogOut, Menu } from "lucide-react";

import { useAuth } from "@/features/auth/useAuth";
import { roleLabels } from "@/lib/roleLabels";

interface TopbarProps {
  onMenuClick: () => void;
}

/** الشريط العلوي: زر فتح القائمة على الهاتف، اسم المستخدم الحالي ودوره، وزر تسجيل الخروج. */
export function Topbar({ onMenuClick }: TopbarProps) {
  const { fullName, role, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-white/20 bg-white/70 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
          {role && <p className="text-xs text-slate-500">{roleLabels[role]}</p>}
        </div>
      </div>

      <button
        onClick={logout}
        className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500
          transition-all duration-300 hover:scale-[1.02] hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98]"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">تسجيل الخروج</span>
      </button>
    </header>
  );
}
