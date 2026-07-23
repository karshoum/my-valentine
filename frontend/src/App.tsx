// File: frontend/src/App.tsx

import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/features/auth/AuthContext";
import { router } from "@/router";

/** مكوّن الجذر: يوفّر سياق المصادقة لكامل شجرة التوجيه. */
export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
