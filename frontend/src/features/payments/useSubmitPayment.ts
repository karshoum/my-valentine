// File: frontend/src/features/payments/useSubmitPayment.ts

import { useState } from "react";

import { apiClient } from "@/lib/apiClient";
import { extractErrorMessage } from "@/lib/apiError";
import type { PaymentMethod } from "@/types/enums";
import type { PaymentOut } from "@/types/payment";

export interface SubmitPaymentInput {
  paymentMethod: PaymentMethod;
  amount: string;
  transactionRef: string | null;
  receiptFile: File | null;
}

/** يرفع إثبات دفع (بنكك/فيزا) لطلب قائم، عبر multipart form-data لدعم إرفاق صورة الإشعار. */
export function useSubmitPayment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitPayment = async (orderId: number, input: SubmitPaymentInput): Promise<PaymentOut | null> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("payment_method", input.paymentMethod);
      formData.append("amount", input.amount);
      if (input.transactionRef) formData.append("transaction_ref", input.transactionRef);
      if (input.receiptFile) formData.append("receipt_file", input.receiptFile);

      const response = await apiClient.post<PaymentOut>(`/api/v1/payments/orders/${orderId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (err) {
      setError(extractErrorMessage(err, "تعذّر رفع إثبات الدفع"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitPayment, isSubmitting, error };
}
