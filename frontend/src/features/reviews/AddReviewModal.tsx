// File: frontend/src/features/reviews/AddReviewModal.tsx

import { Star } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/Modal";
import { useCreateReview } from "@/features/reviews/useCreateReview";
import { inputBaseClass } from "@/lib/designTokens";
import type { ReviewOut } from "@/types/review";

interface AddReviewModalProps {
  onClose: () => void;
  onCreated: (review: ReviewOut) => void;
}

/** نافذة إضافة رأي/تقييم جديد لمستخدم مسجَّل دخوله بالفعل: اختيار عدد نجوم (1-5) وكتابة تعليق. */
export function AddReviewModal({ onClose, onCreated }: AddReviewModalProps) {
  const { createReview, isSubmitting, error } = useCreateReview();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const canSubmit = rating >= 1 && rating <= 5 && comment.trim().length >= 2;

  const handleSubmit = async () => {
    const review = await createReview({ rating, comment: comment.trim() });
    if (review) onCreated(review);
  };

  return (
    <Modal title="أضف رأيك" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">تقييمك</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                aria-label={`${value} نجوم`}
                className="p-0.5"
              >
                <Star
                  size={26}
                  className={value <= rating ? "fill-gold-400 text-gold-400" : "text-slate-300"}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">تعليقك</label>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="شاركنا تجربتك مع الوكالة..."
            rows={4}
            className={`w-full resize-none ${inputBaseClass}`}
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
          {isSubmitting ? "جارٍ الإرسال..." : "نشر الرأي"}
        </button>
      </div>
    </Modal>
  );
}
