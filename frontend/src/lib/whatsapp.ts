// File: frontend/src/lib/whatsapp.ts

/** يبني رابط محادثة واتساب مباشر (wa.me) من رقم هاتف قد يحتوي على "+" أو مسافات أو رموز فاصلة. */
export function buildWhatsAppLink(phoneNumber: string): string {
  const digitsOnly = phoneNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}`;
}
