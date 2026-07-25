// File: frontend/src/features/reviews/ReviewsSection.tsx

import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { StarRating } from "@/components/ui/StarRating";
import { useAuth } from "@/features/auth/useAuth";
import { AddReviewModal } from "@/features/reviews/AddReviewModal";
import { useReviews } from "@/features/reviews/useReviews";

/** قسم آراء العملاء: يعرض كل الآراء المنشورة، ويتيح لأي مستخدم مسجَّل دخوله إضافة رأيه الخاص. */
export function ReviewsSection() {
  const { isAuthenticated } = useAuth();
  const { reviews, isLoading, refetch } = useReviews();
  const [isAddOpen, setIsAddOpen] = useState(false);

  if (isLoading) return null;

  return (
    <div className="border-t border-white/30 bg-white/30 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">آراء عملائنا</h2>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-navy-600 px-3 py-2 text-xs font-semibold
                text-white transition-all duration-300 hover:scale-[1.02] hover:bg-navy-700 active:scale-[0.98]"
            >
              <MessageSquarePlus size={15} />
              أضف رأيك
            </button>
          ) : (
            <Link to="/login" className="text-xs font-medium text-navy-600 hover:underline">
              سجّل دخولك لإضافة رأيك
            </Link>
          )}
        </div>

        {reviews.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد آراء بعد — كن أول من يشارك تجربته.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200/80 bg-white/80 p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">{review.customer_name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isAddOpen && (
        <AddReviewModal
          onClose={() => setIsAddOpen(false)}
          onCreated={() => {
            setIsAddOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
