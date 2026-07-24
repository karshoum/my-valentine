// File: frontend/src/components/layout/Topbar.tsx

import { ExternalLink, LogOut, Menu } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/useAuth";
import { roleLabels } from "@/lib/roleLabels";

interface TopbarProps {
  onMenuClick: () => void;
}

/**
 * الشريط العلوي: زر فتح القائمة على الهاتف، شعار الوكالة (ظاهر دائماً
 * حتى على الهاتف)، اسم المستخدم الحالي ودوره، رابط العودة لصفحة
 * الزوار العامة، وزر تسجيل الخروج.
 */
export function Topbar({ onMenuClick }: TopbarProps) {
  const { fullName, role, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-white/20 bg-white/70 px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:hidden"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </button>
        <img
          src="/logo.png"
          alt="شعار وكالة برادايس"
          className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-sm md:hidden"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{fullName}</p>
          {role && <p className="text-xs text-slate-500">{roleLabels[role]}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500
            transition-all duration-300 hover:scale-[1.02] hover:bg-navy-50 hover:text-navy-700 active:scale-[0.98] sm:px-3"
          title="العودة لصفحة الزوار"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">صفحة الزوار</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-500
            transition-all duration-300 hover:scale-[1.02] hover:bg-rose-50 hover:text-rose-600 active:scale-[0.98] sm:px-3"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">تسجيل الخروج</span>
        </button>
      </div>
    </header>
  );
}
