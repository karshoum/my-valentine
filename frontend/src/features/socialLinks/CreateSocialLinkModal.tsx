// File: frontend/src/features/socialLinks/CreateSocialLinkModal.tsx

import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useManageSocialLink } from "@/features/socialLinks/useManageSocialLink";
import { inputBaseClass } from "@/lib/designTokens";
import type { SocialLinkOut } from "@/types/socialLink";

interface CreateSocialLinkModalProps {
  onClose: () => void;
  onCreated: (link: SocialLinkOut) => void;
}

/** نموذج إضافة رابط تواصل اجتماعي جديد (admin فقط): اسم المنصة (واتساب، فيسبوك، ...) ورابط الصفحة. */
export function CreateSocialLinkModal({ onClose, onCreated }: CreateSocialLinkModalProps) {
  const { createLink, isSubmitting, error } = useManageSocialLink();
  const [platformName, setPlatformName] = useState("");
  const [url, setUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  const canSubmit = platformName.trim().length >= 2 && /^https?:\/\//.test(url.trim());

  const handleSubmit = async () => {
    const link = await createLink({
      platform_name: platformName.trim(),
      url: url.trim(),
      display_order: Number(displayOrder) || 0,
      is_active: true,
    });
    if (link) onCreated(link);
  };

  return (
    <Modal title="إضافة رابط تواصل اجتماعي" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={platformName}
          onChange={(event) => setPlatformName(event.target.value)}
          placeholder="اسم المنصة (مثال: واتساب، فيسبوك، إنستغرام)"
          className={`w-full ${inputBaseClass}`}
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="رابط الصفحة (مثال: https://wa.me/2499xxxxxxx)"
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
          {isSubmitting ? "جارٍ الإضافة..." : "إضافة الرابط"}
        </button>
      </div>
    </Modal>
  );
}
