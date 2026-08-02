// File: frontend/src/components/ui/LoadingIndicator.tsx

interface LoadingIndicatorProps {
  label?: string;
  className?: string;
}

/** مؤشر تحميل موحّد لكل شاشات انتظار الشبكة: شعار الوكالة بحركة نبض بسيطة بدل نص مجرّد. */
export function LoadingIndicator({ label = "جارٍ التحميل...", className = "" }: LoadingIndicatorProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-8 ${className}`}>
      <img src="/logo.png" alt="" className="h-12 w-12 animate-pulse rounded-xl object-cover shadow-sm" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
