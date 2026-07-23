// File: frontend/src/components/ui/KpiCard.tsx

import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  icon: LucideIcon;
  accent?: "emerald" | "violet";
  sparklinePoints?: number[];
}

const accentClasses = {
  emerald: "bg-emerald-500/10 text-emerald-600",
  violet: "bg-violet-500/10 text-violet-600",
};

/** يبني نقاط مسار SVG بسيط (Sparkline) من مصفوفة قيم رقمية. */
function buildSparklinePath(points: number[]): string {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = max - min || 1;
  const stepX = 100 / (points.length - 1 || 1);

  return points
    .map((point, index) => {
      const x = index * stepX;
      const y = 30 - ((point - min) / range) * 30;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** كرت مؤشر أداء رئيسي (KPI) مع أيقونة، نسبة تغيّر، ورسم Sparkline صغير. */
export function KpiCard({ label, value, changePercent, icon: Icon, accent = "emerald", sparklinePoints }: KpiCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;

  return (
    <div
      className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md
        transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[accent]}`}>
          <Icon size={20} />
        </div>
        {changePercent !== undefined && (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}
          >
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(changePercent)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>

      {sparklinePoints && sparklinePoints.length > 1 && (
        <svg viewBox="0 0 100 30" className="mt-3 h-8 w-full" preserveAspectRatio="none">
          <path
            d={buildSparklinePath(sparklinePoints)}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={accent === "emerald" ? "text-emerald-500" : "text-violet-500"}
          />
        </svg>
      )}
    </div>
  );
}
