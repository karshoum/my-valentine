// File: frontend/src/features/reviews/ReviewsAdminPage.tsx

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { StarRating } from "@/components/ui/StarRating";
import { useDeleteReview } from "@/features/reviews/useDeleteReview";
import { useReviews } from "@/features/reviews/useReviews";
import type { ReviewOut } from "@/types/review";

/** شاشة إدارة آراء العملاء (admin فقط): عرض كل الآراء المنشورة مع إمكانية حذف أي رأي نهائياً. */
export function ReviewsAdminPage() {
  const { reviews, isLoading, refetch } = useReviews();
  const { deleteReview, isSubmitting, error } = useDeleteReview();
  const [reviewToDelete, setReviewToDelete] = useState<ReviewOut | null>(null);

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    const succeeded = await deleteReview(reviewToDelete.id);
    if (succeeded) {
      setReviewToDelete(null);
      refetch();
    }
  };

  if (isLoading) {
    return <LoadingIndicator label="جارٍ تحميل الآراء..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">آراء العملاء</h1>
        <p className="text-sm text-slate-500">كل الآراء المنشورة في الصفحة العامة، مع إمكانية حذف أي رأي غير لائق</p>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      {reviews.length === 0 ? (
        <p className="text-sm text-slate-400">لا توجد آراء بعد</p>
      ) : (
        <div className="space-y-2">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <p className="font-semibold text-slate-800">{review.customer_name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
              <button
                type="button"
                onClick={() => setReviewToDelete(review)}
                className="shrink-0 rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {reviewToDelete && (
        <ConfirmDialog
          title="حذف رأي عميل"
          message={`هل أنت متأكد من حذف رأي "${reviewToDelete.customer_name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
          confirmLabel="حذف"
          isConfirming={isSubmitting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setReviewToDelete(null)}
        />
      )}
    </div>
  );
}
