// File: frontend/src/features/socialLinks/SocialLinksPage.tsx

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { CreateSocialLinkModal } from "@/features/socialLinks/CreateSocialLinkModal";
import { useManageSocialLink } from "@/features/socialLinks/useManageSocialLink";
import { useSocialLinks } from "@/features/socialLinks/useSocialLinks";
import type { SocialLinkOut } from "@/types/socialLink";

/**
 * شاشة إدارة روابط التواصل الاجتماعي (admin فقط): إضافة منصة تواصل
 * جديدة (واتساب/فيسبوك/إنستغرام/...) مع رابط صفحتها، تفعيل/إيقاف
 * الظهور في الصفحة العامة، أو حذفها نهائياً.
 */
export function SocialLinksPage() {
  const { links, isLoading, error, refetch } = useSocialLinks();
  const { updateLink, deleteLink, isSubmitting } = useManageSocialLink();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<SocialLinkOut | null>(null);

  const handleToggleActive = async (link: SocialLinkOut) => {
    const updated = await updateLink(link.id, { is_active: !link.is_active });
    if (updated) refetch();
  };

  const handleConfirmDelete = async () => {
    if (!linkToDelete) return;
    const succeeded = await deleteLink(linkToDelete.id);
    if (succeeded) {
      setLinkToDelete(null);
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل روابط التواصل..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">روابط التواصل الاجتماعي</h1>
          <p className="text-sm text-slate-500">تظهر هذه الروابط مباشرة لكل زوّار الصفحة العامة</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold
            text-white transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
        >
          <Plus size={16} />
          إضافة رابط
        </button>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {links.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد روابط تواصل بعد</p>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{link.platform_name}</p>
                <p className="truncate text-xs text-slate-500">{link.url}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    link.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {link.is_active ? "ظاهر" : "مخفي"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(link)}
                  disabled={isSubmitting}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                >
                  {link.is_active ? "إخفاء" : "إظهار"}
                </button>
                <button
                  type="button"
                  onClick={() => setLinkToDelete(link)}
                  className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <CreateSocialLinkModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            refetch();
          }}
        />
      )}

      {linkToDelete && (
        <ConfirmDialog
          title="حذف رابط تواصل"
          message={`هل أنت متأكد من حذف رابط "${linkToDelete.platform_name}"؟`}
          confirmLabel="حذف"
          isConfirming={isSubmitting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setLinkToDelete(null)}
        />
      )}
    </div>
  );
}
