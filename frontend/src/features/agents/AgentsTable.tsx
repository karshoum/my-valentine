// File: frontend/src/features/agents/AgentsTable.tsx

import { paymentModeLabels } from "@/lib/paymentModeLabels";
import type { AgentOut } from "@/types/agent";

interface AgentsTableProps {
  agents: AgentOut[];
  onSelectAgent: (agent: AgentOut) => void;
}

/** جدول تفاعلي لكل ملفات الوكلاء B2B، كل صف قابل للنقر لفتح لوحة التفاصيل. */
export function AgentsTable({ agents, onSelectAgent }: AgentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/20 bg-white/70 shadow-sm backdrop-blur-md">
      <table className="w-full text-start text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 text-xs text-slate-500">
            <th className="px-4 py-3 font-medium">اسم الوكالة</th>
            <th className="px-4 py-3 font-medium">وضع الدفع</th>
            <th className="px-4 py-3 font-medium">رصيد المحفظة</th>
            <th className="px-4 py-3 font-medium">الحد الائتماني</th>
            <th className="px-4 py-3 font-medium">نسبة الخصم</th>
          </tr>
        </thead>
        <tbody>
          {agents.map((agent) => (
            <tr
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50/80"
            >
              <td className="px-4 py-3 font-medium text-slate-800">{agent.agency_name}</td>
              <td className="px-4 py-3">
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                  {paymentModeLabels[agent.payment_mode]}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600">${agent.wallet_balance}</td>
              <td className="px-4 py-3 text-slate-600">${agent.credit_limit}</td>
              <td className="px-4 py-3 text-slate-600">%{agent.discount_rate}</td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                لا يوجد وكلاء مطابقون
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
