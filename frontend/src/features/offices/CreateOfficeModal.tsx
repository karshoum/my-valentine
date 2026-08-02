// File: frontend/src/features/offices/CreateOfficeModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useManageOffice } from "@/features/offices/useManageOffice";
import { inputBaseClass } from "@/lib/designTokens";
import type { OfficeOut } from "@/types/office";

interface CreateOfficeModalProps {
  onClose: () => void;
  onCreated: (office: OfficeOut) => void;
}

/** نموذج إضافة مكتب/فرع جديد (admin فقط): اسم الدولة والعنوان التفصيلي. */
export function CreateOfficeModal({ onClose, onCreated }: CreateOfficeModalProps) {
  const { createOffice, isSubmitting, error } = useManageOffice();
  const [country, setCountry] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const canSubmit = country.trim().length >= 2 && addressLine.trim().length >= 2;

  const handleSubmit = async () => {
    const office = await createOffice({
      country: country.trim(),
      address_line: addressLine.trim(),
      display_order: Number(displayOrder) || 0,
      is_active: true,
    });
    if (office) onCreated(office);
  };

  return (
    <Modal title="إضافة مكتب/فرع" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          placeholder="الدولة (مثال: السودان)"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={addressLine}
          onChange={(event) => setAddressLine(event.target.value)}
          placeholder="العنوان التفصيلي (مثال: المغتربين - شارع محمد نجيب)"
          className={`w-full ${inputBaseClass}`}
        />
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">ترتيب الظهور</label>
          <input
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            type="number"
            className={`w-full ${inputBaseClass}`}
          />
        </div>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
            duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
            disabled:opacity-60"
        >
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة المكتب"}
        </button>
      </div>
    </Modal>
  );
}
