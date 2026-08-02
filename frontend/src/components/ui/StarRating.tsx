// File: frontend/src/components/ui/StarRating.tsx

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
}

/** يعرض تقييماً (1-5) كصف نجوم للقراءة فقط. */
export function StarRating({ rating, size = 15 }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          size={size}
          className={value <= rating ? "fill-gold-400 text-gold-400" : "text-slate-300"}
        />
      ))}
    </div>
  );
}
