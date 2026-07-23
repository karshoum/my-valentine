// File: frontend/src/components/layout/AppLayout.tsx

import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

/** الهيكل العام لصفحات لوحة التحكم: قائمة جانبية + شريط علوي + محتوى الصفحة. */
export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
