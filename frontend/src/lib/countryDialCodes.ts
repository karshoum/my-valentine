// File: frontend/src/lib/countryDialCodes.ts

/** دولة واحدة برمز الاتصال الدولي الخاص بها. */
export interface CountryDialCode {
  isoCode: string;
  nameAr: string;
  dialCode: string;
}

/** قائمة دول تغطي السودان والخليج ومصر وتركيا وأهم وجهات عملاء الوكالة، مرتبة بحيث تظهر الأقرب أولاً. */
export const COUNTRY_DIAL_CODES: CountryDialCode[] = [
  { isoCode: "SD", nameAr: "السودان", dialCode: "+249" },
  { isoCode: "SA", nameAr: "السعودية", dialCode: "+966" },
  { isoCode: "AE", nameAr: "الإمارات", dialCode: "+971" },
  { isoCode: "QA", nameAr: "قطر", dialCode: "+974" },
  { isoCode: "KW", nameAr: "الكويت", dialCode: "+965" },
  { isoCode: "BH", nameAr: "البحرين", dialCode: "+973" },
  { isoCode: "OM", nameAr: "عُمان", dialCode: "+968" },
  { isoCode: "EG", nameAr: "مصر", dialCode: "+20" },
  { isoCode: "JO", nameAr: "الأردن", dialCode: "+962" },
  { isoCode: "TR", nameAr: "تركيا", dialCode: "+90" },
  { isoCode: "SS", nameAr: "جنوب السودان", dialCode: "+211" },
  { isoCode: "ET", nameAr: "إثيوبيا", dialCode: "+251" },
  { isoCode: "KE", nameAr: "كينيا", dialCode: "+254" },
  { isoCode: "UG", nameAr: "أوغندا", dialCode: "+256" },
  { isoCode: "RW", nameAr: "رواندا", dialCode: "+250" },
  { isoCode: "TZ", nameAr: "تنزانيا", dialCode: "+255" },
  { isoCode: "MA", nameAr: "المغرب", dialCode: "+212" },
  { isoCode: "TN", nameAr: "تونس", dialCode: "+216" },
  { isoCode: "DZ", nameAr: "الجزائر", dialCode: "+213" },
  { isoCode: "LY", nameAr: "ليبيا", dialCode: "+218" },
  { isoCode: "IQ", nameAr: "العراق", dialCode: "+964" },
  { isoCode: "SY", nameAr: "سوريا", dialCode: "+963" },
  { isoCode: "LB", nameAr: "لبنان", dialCode: "+961" },
  { isoCode: "YE", nameAr: "اليمن", dialCode: "+967" },
  { isoCode: "PS", nameAr: "فلسطين", dialCode: "+970" },
  { isoCode: "IN", nameAr: "الهند", dialCode: "+91" },
  { isoCode: "PK", nameAr: "باكستان", dialCode: "+92" },
  { isoCode: "RU", nameAr: "روسيا", dialCode: "+7" },
  { isoCode: "GB", nameAr: "بريطانيا", dialCode: "+44" },
  { isoCode: "US", nameAr: "أمريكا", dialCode: "+1" },
  { isoCode: "DE", nameAr: "ألمانيا", dialCode: "+49" },
  { isoCode: "FR", nameAr: "فرنسا", dialCode: "+33" },
  { isoCode: "MY", nameAr: "ماليزيا", dialCode: "+60" },
  { isoCode: "ZA", nameAr: "جنوب أفريقيا", dialCode: "+27" },
];

export const DEFAULT_DIAL_CODE = "+249";

/** يبحث عن رمز اتصال دولة برمزها ISO (SA، AE، SD...)، أو يُعيد الرمز الافتراضي (السودان) إن لم توجد. */
export function findDialCodeByIsoCode(isoCode: string | undefined): string {
  if (!isoCode) return DEFAULT_DIAL_CODE;
  return COUNTRY_DIAL_CODES.find((country) => country.isoCode === isoCode)?.dialCode ?? DEFAULT_DIAL_CODE;
}
