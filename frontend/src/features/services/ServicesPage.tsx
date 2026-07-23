// File: frontend/src/features/services/ServicesPage.tsx

import { Plus } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CreateServiceModal } from "@/features/services/CreateServiceModal";
import { DiscountModal } from "@/features/services/DiscountModal";
import { EditServiceModal } from "@/features/services/EditServiceModal";
import { ServicesTable } from "@/features/services/ServicesTable";
import { useDeleteService } from "@/features/services/useDeleteService";
import { useServicesForManagement } from "@/features/services/useServicesForManagement";
import type { ServiceOut } from "@/types/service";

/** الشاشة التفصيلية لإدارة كتالوج الخدمات: إضافة، تعديل، حذف، وعروض خصم (موظف/مدير). */
export function ServicesPage() {
  const { services, isLoading, error, refetch } = useServicesForManagement();
  const { deleteService, isSubmitting: isDeleting, error: deleteError } = useDeleteService();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [serviceBeingEdited, setServiceBeingEdited] = useState<ServiceOut | null>(null);
  const [serviceForDiscount, setServiceForDiscount] = useState<ServiceOut | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceOut | null>(null);

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    const succeeded = await deleteService(serviceToDelete.id);
    if (succeeded) {
      setServiceToDelete(null);
      refetch();
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">جارٍ تحميل الخدمات...</p>;
  }

  if (error) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">الخدمات</h1>
          <p className="text-sm text-slate-500">كتالوج خدمات الوكالة الكامل — إضافة، تعديل، تعطيل، حذف، وعروض خصم</p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white
            transition-all duration-300 hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
        >
          <Plus size={16} />
          إضافة خدمة
        </button>
      </div>

      <ServicesTable
        services={services}
        onEdit={setServiceBeingEdited}
        onSetDiscount={setServiceForDiscount}
        onDelete={setServiceToDelete}
      />

      {isCreateModalOpen && (
        <CreateServiceModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}

      {serviceBeingEdited && (
        <EditServiceModal
          service={serviceBeingEdited}
          onClose={() => setServiceBeingEdited(null)}
          onUpdated={() => {
            setServiceBeingEdited(null);
            refetch();
          }}
        />
      )}

      {serviceForDiscount && (
        <DiscountModal
          service={serviceForDiscount}
          onClose={() => setServiceForDiscount(null)}
          onUpdated={() => {
            setServiceForDiscount(null);
            refetch();
          }}
        />
      )}

      {serviceToDelete && (
        <ConfirmDialog
          title="حذف خدمة"
          message={`هل أنت متأكد من حذف "${serviceToDelete.title}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="حذف نهائياً"
          isConfirming={isDeleting}
          errorMessage={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => setServiceToDelete(null)}
        />
      )}
    </div>
  );
}
