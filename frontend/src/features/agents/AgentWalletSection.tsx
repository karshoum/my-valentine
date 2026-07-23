// File: frontend/src/features/agents/AgentWalletSection.tsx

import { useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { walletTransactionTypeLabels } from "@/lib/paymentModeLabels";
import { useAgentWallet } from "@/features/agents/useAgentWallet";
import type { AgentOut } from "@/types/agent";

interface AgentWalletSectionProps {
  agent: AgentOut;
  canDeposit: boolean;
  onWalletChanged: () => void;
}

/** يعرض رصيد محفظة الوكيل، نموذج إيداع (موظف/مدير)، وسجل الحركات الكامل. */
export function AgentWalletSection({ agent, canDeposit, onWalletChanged }: AgentWalletSectionProps) {
  const { logs, isLoading, isDepositing, error, deposit } = useAgentWallet(agent.id);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleDeposit = async () => {
    if (!amount) return;
    const succeeded = await deposit(amount, notes || null);
    if (succeeded) {
      setAmount("");
      setNotes("");
      onWalletChanged();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs text-emerald-700">الرصيد الحالي</p>
        <p className="text-2xl font-bold text-emerald-800">${agent.wallet_balance}</p>
      </div>

      {canDeposit && (
        <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <p className="text-sm font-medium text-slate-700">إيداع مبلغ</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              type="number"
              placeholder="المبلغ"
              className={inputBaseClass}
            />
            <input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="ملاحظة (اختياري)"
              className={inputBaseClass}
            />
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="button"
            onClick={handleDeposit}
            disabled={isDepositing}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all
              duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            {isDepositing ? "جارٍ الإيداع..." : "تأكيد الإيداع"}
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">سجل الحركات</p>
        {isLoading ? (
          <p className="text-sm text-slate-400">جارٍ التحميل...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400">لا توجد حركات بعد</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{walletTransactionTypeLabels[log.transaction_type]}</p>
                  {log.notes && <p className="text-xs text-slate-500">{log.notes}</p>}
                  <p className="text-xs text-slate-400">{new Date(log.created_at).toLocaleString("ar")}</p>
                </div>
                <p
                  className={`font-semibold ${
                    log.transaction_type === "deduction" ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {log.transaction_type === "deduction" ? "-" : "+"}${log.amount}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
