// File: frontend/src/router.tsx

import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ForgotPasswordPage } from "@/features/auth/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/LoginPage";
import { RegisterPage } from "@/features/auth/RegisterPage";
import { ResetPasswordPage } from "@/features/auth/ResetPasswordPage";
import { AgentsPage } from "@/features/agents/AgentsPage";
import { CurrenciesPage } from "@/features/currencies/CurrenciesPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { BookingFeeSettingsPage } from "@/features/flights/BookingFeeSettingsPage";
import { OrdersPage } from "@/features/orders/OrdersPage";
import { ShipRoutesPage } from "@/features/shipRoutes/ShipRoutesPage";
import { PaymentsPage } from "@/features/payments/PaymentsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";
import { PublicLandingPage } from "@/features/public/PublicLandingPage";
import { RefundsPage } from "@/features/refunds/RefundsPage";
import { ReviewsAdminPage } from "@/features/reviews/ReviewsAdminPage";
import { ServicesPage } from "@/features/services/ServicesPage";
import { SocialLinksPage } from "@/features/socialLinks/SocialLinksPage";
import { UsersPage } from "@/features/users/UsersPage";

/**
 * خريطة توجيه التطبيق الكاملة: الصفحة الرئيسية العامة لكل الزوار ("/")،
 * شاشتا الدخول والتسجيل العامتان، ولوحة التحكم المحمية تحت "/dashboard".
 */
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/services/flight" replace /> },
  { path: "/services/:category", element: <PublicLandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
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
      { path: "users", element: <UsersPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "payments", element: <PaymentsPage /> },
      { path: "refunds", element: <RefundsPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "currencies", element: <CurrenciesPage /> },
      { path: "flight-booking-fee", element: <BookingFeeSettingsPage /> },
      { path: "ship-routes", element: <ShipRoutesPage /> },
      { path: "social-links", element: <SocialLinksPage /> },
      { path: "reviews", element: <ReviewsAdminPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);
