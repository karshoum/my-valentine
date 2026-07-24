// File: frontend/src/router.tsx

import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { AgentsPage } from "@/features/agents/AgentsPage";
import { CurrenciesPage } from "@/features/currencies/CurrenciesPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { BookingFeeSettingsPage } from "@/features/flights/BookingFeeSettingsPage";
import { OrdersPage } from "@/features/orders/OrdersPage";
import { PaymentsPage } from "@/features/payments/PaymentsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { PublicLandingPage } from "@/features/public/PublicLandingPage";
import { RefundsPage } from "@/features/refunds/RefundsPage";
import { ServicesPage } from "@/features/services/ServicesPage";

/**
 * خريطة توجيه التطبيق الكاملة: الصفحة الرئيسية العامة لكل الزوار ("/")،
 * شاشتا الدخول والتسجيل العامتان، ولوحة التحكم المحمية تحت "/dashboard".
 */
export const router = createBrowserRouter([
  { path: "/", element: <PublicLandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "refunds", element: <RefundsPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "currencies", element: <CurrenciesPage /> },
      { path: "flight-booking-fee", element: <BookingFeeSettingsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
