// File: frontend/src/features/profile/AgentProfileCard.tsx

import { paymentModeLabels } from "@/lib/paymentModeLabels";
import type { AgentOut } from "@/types/agent";

/** كرت ملخّص ملف الوكيل B2B الخاص بالمستخدم الحالي (للعرض فقط، للتعديل راجع شاشة الوكلاء). */
export function AgentProfileCard({ agentProfile }: { agentProfile: AgentOut }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="mb-4 text-sm font-bold text-slate-900">ملف الوكالة (B2B)</h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-500">اسم الوكالة</p>
          <p className="mt-0.5 font-medium text-slate-800">{agentProfile.agency_name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">وضع الدفع</p>
          <p className="mt-0.5 font-medium text-slate-800">{paymentModeLabels[agentProfile.payment_mode]}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">رصيد المحفظة</p>
          <p className="mt-0.5 font-semibold text-emerald-700">${agentProfile.wallet_balance}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">الحد الائتماني</p>
          <p className="mt-0.5 font-medium text-slate-800">${agentProfile.credit_limit}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">نسبة الخصم</p>
          <p className="mt-0.5 font-medium text-slate-800">%{agentProfile.discount_rate}</p>
        </div>
      </div>
    </div>
  );
}
