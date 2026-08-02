// File: frontend/src/features/agents/AgentDetailPanel.tsx

import { X } from "lucide-react";

import { useAuth } from "@/features/auth/useAuth";
import { AgentCustomRateForm } from "@/features/agents/AgentCustomRateForm";
import { AgentEditForm } from "@/features/agents/AgentEditForm";
import { AgentWalletSection } from "@/features/agents/AgentWalletSection";
import type { AgentOut } from "@/types/agent";

interface AgentDetailPanelProps {
  agent: AgentOut;
  onClose: () => void;
  onAgentUpdated: (updatedAgent: AgentOut) => void;
  onWalletChanged: () => void;
}

/** لوحة جانبية بتفاصيل وكيل B2B كاملة: الشروط، المحفظة، والأسعار الخاصة. */
export function AgentDetailPanel({ agent, onClose, onAgentUpdated, onWalletChanged }: AgentDetailPanelProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const canDeposit = role === "admin" || role === "employee";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-s border-white/20 bg-white/95 p-6 shadow-xl
          backdrop-blur-md"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-base font-bold text-slate-900">{agent.agency_name}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <section className="mb-6">
          <AgentWalletSection agent={agent} canDeposit={canDeposit} onWalletChanged={onWalletChanged} />
        </section>

        {isAdmin && (
          <>
            <section className="mb-6">
              <AgentEditForm agent={agent} onUpdated={onAgentUpdated} />
            </section>

            <section>
              <AgentCustomRateForm agentId={agent.id} />
            </section>
          </>
        )}
      </div>
    </div>
  );
}
