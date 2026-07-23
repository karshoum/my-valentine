// File: frontend/src/components/ui/FilterPill.tsx

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

/** شارة تصفية سريعة (Pill) قابلة للنقر، تُستخدم في كل جداول التصفية عبر المنصة. */
export function FilterPill({ label, isActive, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300 active:scale-[0.98] ${
        isActive ? "bg-navy-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
