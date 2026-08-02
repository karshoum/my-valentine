// File: frontend/src/features/offices/OfficesPage.tsx

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { CreateOfficeModal } from "@/features/offices/CreateOfficeModal";
import { useManageOffice } from "@/features/offices/useManageOffice";
import { useOffices } from "@/features/offices/useOffices";
import type { OfficeOut } from "@/types/office";

/**
 * شاشة إدارة المكاتب/الفروع (admin فقط): إضافة مكتب جديد (دولة +
 * عنوان)، تفعيل/إيقاف الظهور في الصفحة العامة، أو حذفه نهائياً.
 */
export function OfficesPage() {
  const { offices, isLoading, error, refetch } = useOffices();
  const { updateOffice, deleteOffice, isSubmitting } = useManageOffice();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<OfficeOut | null>(null);

  const handleToggleActive = async (office: OfficeOut) => {
    const updated = await updateOffice(office.id, { is_active: !office.is_active });
    if (updated) refetch();
  };

  const handleConfirmDelete = async () => {
    if (!officeToDelete) return;
    const succeeded = await deleteOffice(officeToDelete.id);
    if (succeeded) {
      setOfficeToDelete(null);
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل المكاتب..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">مكاتبنا</h1>
          <p className="text-sm text-slate-500">تظهر هذه العناوين مباشرة لكل زوّار الصفحة العامة</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-4 py-2.5 text-sm font-semibold
            text-white transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
        >
          <Plus size={16} />
          إضافة مكتب
        </button>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {offices.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد مكاتب مضافة بعد</p>
      ) : (
        <div className="space-y-2">
          {offices.map((office) => (
            <div
              key={office.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-900">{office.country}</p>
                <p className="truncate text-xs text-slate-500">{office.address_line}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    office.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {office.is_active ? "ظاهر" : "مخفي"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleActive(office)}
                  disabled={isSubmitting}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-600 hover:bg-navy-50"
                >
                  {office.is_active ? "إخفاء" : "إظهار"}
                </button>
                <button
                  type="button"
                  onClick={() => setOfficeToDelete(office)}
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
        <CreateOfficeModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            refetch();
          }}
        />
      )}

      {officeToDelete && (
        <ConfirmDialog
          title="حذف مكتب"
          message={`هل أنت متأكد من حذف مكتب "${officeToDelete.country}"؟`}
          confirmLabel="حذف"
          isConfirming={isSubmitting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setOfficeToDelete(null)}
        />
      )}
    </div>
  );
}
