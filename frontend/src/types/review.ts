// File: frontend/src/types/review.ts

/** مطابق لـ app.schemas.review.ReviewCreateRequest. */
export interface ReviewCreateRequest {
  rating: number;
  comment: string;
}

/** مطابق لـ app.schemas.review.ReviewOut. */
export interface ReviewOut {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}
