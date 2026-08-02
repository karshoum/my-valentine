// File: frontend/src/components/ui/SplashScreen.tsx

import { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinished: () => void;
}

const VISIBLE_DURATION_MS = 1800;
const FADE_OUT_DURATION_MS = 500;

/**
 * واجهة ترحيبية تظهر لثوانٍ قليلة عند كل تحميل جديد للتطبيق: شعار
 * الوكالة ورسالة ترحيب، بدخول وخروج تدريجيَين، ثم تختفي لتكشف عن
 * المحتوى الفعلي الذي يكون قد جاهز بالفعل خلف الشاشة.
 */
export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const entranceFrame = requestAnimationFrame(() => setIsVisible(true));
    const fadeTimer = setTimeout(() => setIsFadingOut(true), VISIBLE_DURATION_MS);
    const finishTimer = setTimeout(onFinished, VISIBLE_DURATION_MS + FADE_OUT_DURATION_MS);
    return () => {
      cancelAnimationFrame(entranceFrame);
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-gradient-to-br
        from-cream-50 to-cream-200 transition-opacity duration-500 ${isFadingOut ? "opacity-0" : "opacity-100"}`}
    >
      <img
        src="/logo.png"
        alt="شعار وكالة برادايس"
        className={`h-24 w-24 rounded-2xl object-cover shadow-lg transition-all duration-700 sm:h-28 sm:w-28 ${
          isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
        }`}
      />
      <div
        className={`text-center transition-all delay-200 duration-700 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="text-lg font-bold text-slate-900 sm:text-xl">مرحباً بكم في برادايس للسفر والسياحة</p>
        <p className="mt-1 text-sm text-slate-500">رحلتكم تبدأ من هنا</p>
      </div>
    </div>
  );
}
