// File: frontend/src/features/agents/AgentsPage.tsx

import { Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { inputBaseClass } from "@/lib/designTokens";
import { useAuth } from "@/features/auth/useAuth";
import { AgentDetailPanel } from "@/features/agents/AgentDetailPanel";
import { AgentsTable } from "@/features/agents/AgentsTable";
import { CreateAgentModal } from "@/features/agents/CreateAgentModal";
import { useAgents } from "@/features/agents/useAgents";
import type { AgentOut } from "@/types/agent";

/** الشاشة التفصيلية لوكلاء B2B: بحث، إضافة وكيل، ولوحة تفاصيل بالمحفظة والشروط. */
export function AgentsPage() {
  const { role } = useAuth();
  const { agents, isLoading, error, refetch } = useAgents();
  const [searchText, setSearchText] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<AgentOut | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredAgents = useMemo(
    () =>
      searchText.trim()
        ? agents.filter((agent) => agent.agency_name.toLowerCase().includes(searchText.trim().toLowerCase()))
        : agents,
    [agents, searchText],
  );

  const handleAgentUpdated = (updatedAgent: AgentOut) => {
    setSelectedAgent(updatedAgent);
    refetch();
  };

  // يزامن اللوحة المفتوحة مع أحدث بيانات الوكيل كلما تغيّرت قائمة الوكلاء (مثال: بعد إيداع في المحفظة).
  useEffect(() => {
    if (!selectedAgent) return;
    const freshAgent = agents.find((agent) => agent.id === selectedAgent.id);
    if (freshAgent && freshAgent !== selectedAgent) setSelectedAgent(freshAgent);
  }, [agents, selectedAgent]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">جارٍ تحميل الوكلاء...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">الوكلاء (B2B)</h1>
          <p className="text-sm text-slate-500">إدارة حسابات الفرانشايز، محافظهم، وأسعارهم الخاصة</p>
        </div>
        {role === "admin" && (
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold
              text-white transition-all duration-300 hover:scale-[1.02] hover:bg-violet-700 active:scale-[0.98]"
          >
            <Plus size={16} />
            إضافة وكيل
          </button>
        )}
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="ابحث باسم الوكالة..."
          className={`w-full pe-9 ${inputBaseClass}`}
        />
      </div>

      <AgentsTable agents={filteredAgents} onSelectAgent={setSelectedAgent} />

      {selectedAgent && (
        <AgentDetailPanel
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
          onAgentUpdated={handleAgentUpdated}
          onWalletChanged={refetch}
        />
      )}

      {isCreateModalOpen && (
        <CreateAgentModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
