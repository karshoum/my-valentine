// File: frontend/src/components/ui/ComingSoonPage.tsx

import { Construction } from "lucide-react";

/** شاشة مؤقتة لأقسام لوحة التحكم التي لم تُبنَ شاشاتها التفصيلية بعد. */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/70 p-12 text-center shadow-sm backdrop-blur-md">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
        <Construction size={24} />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">هذه الشاشة قيد البناء في مرحلة قادمة من المشروع.</p>
    </div>
  );
}
