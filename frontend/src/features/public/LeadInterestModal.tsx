// File: frontend/src/features/public/LeadInterestModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCreateLead } from "@/features/public/useCreateLead";
import { inputBaseClass } from "@/lib/designTokens";
import type { LeadServiceType } from "@/types/enums";

interface LeadInterestModalProps {
  serviceType: LeadServiceType;
  title: string;
  onClose: () => void;
}

/**
 * نافذة تسجيل اهتمام زائر بخدمة مستقبلية لم تُطلق بعد (لوجستيك أو دعاية
 * وإعلان): تجمع الاسم ورقم الهاتف وتفاصيل اختيارية، وترسلها كطلب Lead
 * عام يراه الموظفون لاحقاً من لوحة التحكم.
 */
export function LeadInterestModal({ serviceType, title, onClose }: LeadInterestModalProps) {
  const { createLead, isSubmitting, error } = useCreateLead();
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const canSubmit = customerName.trim().length >= 2 && phone.trim().length >= 6;

  const handleSubmit = async () => {
    const lead = await createLead({
      service_type: serviceType,
      customer_name: customerName.trim(),
      phone: phone.trim(),
      details: details.trim() || null,
    });
    if (lead) setHasSubmitted(true);
  };

  return (
    <Modal title={title} onClose={onClose}>
      {hasSubmitted ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-slate-700">
            تم تسجيل اهتمامك بنجاح! سنتواصل معك عبر رقم الواتساب فور إطلاق هذه الخدمة.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
          >
            إغلاق
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            هذه الخدمة قيد التحضير. سجّل اهتمامك وسيتواصل معك فريقنا فور إطلاقها.
          </p>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="الاسم الكامل"
            className={`w-full ${inputBaseClass}`}
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="رقم واتساب للتواصل"
            className={`w-full ${inputBaseClass}`}
          />
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="تفاصيل إضافية (اختياري)"
            rows={3}
            className={`w-full ${inputBaseClass}`}
          />

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="w-full rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold text-white transition-all
              duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الإرسال..." : "سجّل اهتمامي"}
          </button>
        </div>
      )}
    </Modal>
  );
}
