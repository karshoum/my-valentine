// File: frontend/src/components/layout/Sidebar.tsx

import { X } from "lucide-react";
import { NavLink } from "react-router-dom";

import { navItems } from "@/components/layout/navConfig";
import { useAuth } from "@/features/auth/useAuth";

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

/**
 * القائمة الجانبية: ثابتة ودائمة الظهور على شاشات md فما فوق، وقائمة
 * منسدلة (Drawer) فوق المحتوى على شاشات الهاتف تُفتح عبر زر القائمة في
 * الشريط العلوي وتُغلَق بالنقر على الخلفية أو على أي رابط تنقّل.
 */
export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { role } = useAuth();
  const visibleItems = navItems.filter((item) => role && item.allowedRoles.includes(role));

  const brand = (
    <div className="mb-6 flex items-center gap-2 px-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
        ب
      </div>
      <span className="text-sm font-bold text-slate-800">وكالة براديس</span>
    </div>
  );

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {visibleItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          onClick={onMobileClose}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
              isActive
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
            }`
          }
        >
          <item.icon size={18} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-e border-white/20 bg-white/70 p-4 backdrop-blur-md md:flex md:flex-col">
        {brand}
        {navLinks}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-e border-white/20 bg-white/95 p-4 shadow-xl backdrop-blur-md">
            <div className="mb-2 flex items-center justify-between">
              {brand}
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>
            {navLinks}
          </aside>
        </div>
      )}
    </>
  );
}
