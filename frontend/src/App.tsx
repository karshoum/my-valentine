// File: frontend/src/App.tsx

import { useState } from "react";
import { RouterProvider } from "react-router-dom";

import { SplashScreen } from "@/components/ui/SplashScreen";
import { AuthProvider } from "@/features/auth/AuthContext";
import { router } from "@/router";

/**
 * مكوّن الجذر: يوفّر سياق المصادقة لكامل شجرة التوجيه، ويعرض واجهة
 * ترحيبية فوق المحتوى عند كل تحميل جديد للتطبيق (المحتوى الفعلي يُحمَّل
 * خلفها بالتوازي، فيظهر جاهزاً مباشرة بمجرد اختفائها).
 */
export function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
