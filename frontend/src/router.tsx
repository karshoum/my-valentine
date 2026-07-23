// File: frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ComingSoonPage } from "@/components/ui/ComingSoonPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

/** خريطة توجيه التطبيق الكاملة: شاشة الدخول العامة، وشاشات لوحة التحكم المحمية. */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <ComingSoonPage title="الطلبات" /> },
      { path: "agents", element: <ComingSoonPage title="الوكلاء (B2B)" /> },
      { path: "currencies", element: <ComingSoonPage title="العملات وسعر الصرف" /> },
      { path: "profile", element: <ComingSoonPage title="حسابي" /> },
    ],
  },
]);
