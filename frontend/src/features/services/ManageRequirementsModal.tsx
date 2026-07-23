// File: frontend/src/features/services/ManageRequirementsModal.tsx

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useManageRequirements } from "@/features/services/useManageRequirements";
import { inputBaseClass } from "@/lib/designTokens";
import type { ServiceOut, ServiceRequirementOut } from "@/types/service";

interface ManageRequirementsModalProps {
  service: ServiceOut;
  onClose: () => void;
  onChanged: (requirements: ServiceRequirementOut[]) => void;
}

/**
 * نافذة إدارة قائمة المستندات/المتطلبات المطلوبة لخدمة واحدة: عرض
 * البنود الحالية مع إمكانية تعديل نصها أو حذفها، وإضافة بند جديد
 * (موظف أو مدير). التغييرات تُطبَّق فوراً عبر الـ API ثم تُعاد للأعلى.
 */
export function ManageRequirementsModal({ service, onClose, onChanged }: ManageRequirementsModalProps) {
  const { addRequirement, updateRequirement, deleteRequirement, isSubmitting, error } = useManageRequirements();
  const [requirements, setRequirements] = useState<ServiceRequirementOut[]>(service.requirements);
  const [newRequirementText, setNewRequirementText] = useState("");

  const handleAdd = async () => {
    const text = newRequirementText.trim();
    if (!text) return;
    const created = await addRequirement(service.id, { requirement_text: text, display_order: requirements.length });
    if (created) {
      const updatedList = [...requirements, created];
      setRequirements(updatedList);
      setNewRequirementText("");
      onChanged(updatedList);
    }
  };

  const handleTextChange = (requirementId: number, text: string) => {
    setRequirements((current) =>
      current.map((requirement) => (requirement.id === requirementId ? { ...requirement, requirement_text: text } : requirement)),
    );
  };

  const handleSaveText = async (requirementId: number, text: string) => {
    const updated = await updateRequirement(requirementId, { requirement_text: text });
    if (updated) onChanged(requirements.map((requirement) => (requirement.id === requirementId ? updated : requirement)));
  };

  const handleDelete = async (requirementId: number) => {
    const succeeded = await deleteRequirement(requirementId);
    if (succeeded) {
      const updatedList = requirements.filter((requirement) => requirement.id !== requirementId);
      setRequirements(updatedList);
      onChanged(updatedList);
    }
  };

  return (
    <Modal title={`متطلبات المستندات: ${service.title}`} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500">هذه القائمة تظهر للعميل عند إنشاء طلب لهذه الخدمة.</p>

        <div className="space-y-2">
          {requirements.map((requirement) => (
            <div key={requirement.id} className="flex items-start gap-2">
              <input
                value={requirement.requirement_text}
                onChange={(event) => handleTextChange(requirement.id, event.target.value)}
                onBlur={(event) => handleSaveText(requirement.id, event.target.value)}
                className={`w-full ${inputBaseClass}`}
              />
              <button
                type="button"
                onClick={() => handleDelete(requirement.id)}
                disabled={isSubmitting}
                title="حذف"
                className="mt-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {requirements.length === 0 && <p className="text-sm text-slate-400">لا توجد بنود متطلبات بعد.</p>}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-200/80 pt-3">
          <input
            value={newRequirementText}
            onChange={(event) => setNewRequirementText(event.target.value)}
            placeholder="بند متطلب جديد (مثال: صورة جواز السفر ساري المفعول)"
            className={`w-full ${inputBaseClass}`}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSubmitting || !newRequirementText.trim()}
            title="إضافة"
            className="rounded-lg bg-emerald-600 p-2 text-white transition-colors hover:bg-emerald-700
              disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
          </button>
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
