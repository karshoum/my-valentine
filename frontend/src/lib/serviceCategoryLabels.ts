// File: frontend/src/lib/serviceCategoryLabels.ts

import type { ServiceCategory } from "@/types/enums";

/** الاسم الظاهر بالعربية لكل تصنيف خدمة (مطابق لـ app.models.enums.ServiceCategory). */
export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  flight: "تذاكر طيران",
  ship_ticket: "تذاكر بواخر",
  visa: "تأشيرات",
  residency: "إقامات عمل",
  insurance: "تأمين طبي",
  renewal_extension: "تجديد وتمديد",
  security_approval: "موافقات أمنية",
  procedure_package: "بكجات تخليص إجراءات",
  tourism_package: "بكجات سياحية",
  document_extraction: "خدمات استخراج",
  attestation: "خدمات توثيق",
};
