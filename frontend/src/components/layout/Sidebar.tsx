// File: frontend/src/components/layout/Sidebar.tsx

import { NavLink } from "react-router-dom";

import { navItems } from "@/components/layout/navConfig";
import { useAuth } from "@/features/auth/useAuth";

/** القائمة الجانبية الثابتة، تعرض فقط العناصر المسموحة لدور المستخدم الحالي. */
export function Sidebar() {
  const { role } = useAuth();
  const visibleItems = navItems.filter((item) => role && item.allowedRoles.includes(role));

  return (
    <aside className="hidden w-64 shrink-0 border-e border-white/20 bg-white/70 p-4 backdrop-blur-md md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold">
          ب
        </div>
        <span className="text-sm font-bold text-slate-800">وكالة براديس</span>
      </div>

      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
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
    </aside>
  );
}
