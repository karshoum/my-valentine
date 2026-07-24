// File: frontend/src/lib/airports.ts

/** مطار واحد قابل للبحث بالاسم العربي أو الإنجليزي أو رمز IATA. */
export interface Airport {
  code: string;
  city_ar: string;
  city_en: string;
  country_ar: string;
}

/**
 * قائمة مطارات ثابتة تغطي أهم وجهات عملاء الوكالة (السودان، الخليج،
 * مصر، تركيا، وجهات دولية شائعة للفيزا/الدراسة/العلاج). قائمة يدوية
 * وليست مربوطة بأي API خارجي حي.
 */
export const AIRPORTS: Airport[] = [
  { code: "KRT", city_ar: "الخرطوم", city_en: "Khartoum", country_ar: "السودان" },
  { code: "PZU", city_ar: "بورتسودان", city_en: "Port Sudan", country_ar: "السودان" },
  { code: "EBD", city_ar: "الأبيض", city_en: "El Obeid", country_ar: "السودان" },
  { code: "UYL", city_ar: "نيالا", city_en: "Nyala", country_ar: "السودان" },
  { code: "JUB", city_ar: "جوبا", city_en: "Juba", country_ar: "جنوب السودان" },
  { code: "JED", city_ar: "جدة", city_en: "Jeddah", country_ar: "السعودية" },
  { code: "RUH", city_ar: "الرياض", city_en: "Riyadh", country_ar: "السعودية" },
  { code: "DMM", city_ar: "الدمام", city_en: "Dammam", country_ar: "السعودية" },
  { code: "MED", city_ar: "المدينة المنورة", city_en: "Medina", country_ar: "السعودية" },
  { code: "AHB", city_ar: "أبها", city_en: "Abha", country_ar: "السعودية" },
  { code: "DXB", city_ar: "دبي", city_en: "Dubai", country_ar: "الإمارات" },
  { code: "AUH", city_ar: "أبوظبي", city_en: "Abu Dhabi", country_ar: "الإمارات" },
  { code: "SHJ", city_ar: "الشارقة", city_en: "Sharjah", country_ar: "الإمارات" },
  { code: "DOH", city_ar: "الدوحة", city_en: "Doha", country_ar: "قطر" },
  { code: "KWI", city_ar: "الكويت", city_en: "Kuwait City", country_ar: "الكويت" },
  { code: "BAH", city_ar: "المنامة", city_en: "Manama", country_ar: "البحرين" },
  { code: "MCT", city_ar: "مسقط", city_en: "Muscat", country_ar: "عُمان" },
  { code: "AMM", city_ar: "عمّان", city_en: "Amman", country_ar: "الأردن" },
  { code: "CAI", city_ar: "القاهرة", city_en: "Cairo", country_ar: "مصر" },
  { code: "HBE", city_ar: "الإسكندرية", city_en: "Alexandria", country_ar: "مصر" },
  { code: "SSH", city_ar: "شرم الشيخ", city_en: "Sharm El Sheikh", country_ar: "مصر" },
  { code: "IST", city_ar: "إسطنبول", city_en: "Istanbul", country_ar: "تركيا" },
  { code: "SAW", city_ar: "إسطنبول (صبيحة)", city_en: "Istanbul Sabiha", country_ar: "تركيا" },
  { code: "ESB", city_ar: "أنقرة", city_en: "Ankara", country_ar: "تركيا" },
  { code: "ADB", city_ar: "إزمير", city_en: "Izmir", country_ar: "تركيا" },
  { code: "ADD", city_ar: "أديس أبابا", city_en: "Addis Ababa", country_ar: "إثيوبيا" },
  { code: "NBO", city_ar: "نيروبي", city_en: "Nairobi", country_ar: "كينيا" },
  { code: "EBB", city_ar: "عنتيبي", city_en: "Entebbe", country_ar: "أوغندا" },
  { code: "KGL", city_ar: "كيغالي", city_en: "Kigali", country_ar: "رواندا" },
  { code: "DAR", city_ar: "دار السلام", city_en: "Dar es Salaam", country_ar: "تنزانيا" },
  { code: "CMN", city_ar: "الدار البيضاء", city_en: "Casablanca", country_ar: "المغرب" },
  { code: "TUN", city_ar: "تونس", city_en: "Tunis", country_ar: "تونس" },
  { code: "ALG", city_ar: "الجزائر", city_en: "Algiers", country_ar: "الجزائر" },
  { code: "LHR", city_ar: "لندن (هيثرو)", city_en: "London Heathrow", country_ar: "بريطانيا" },
  { code: "LGW", city_ar: "لندن (غاتويك)", city_en: "London Gatwick", country_ar: "بريطانيا" },
  { code: "CDG", city_ar: "باريس", city_en: "Paris", country_ar: "فرنسا" },
  { code: "FRA", city_ar: "فرانكفورت", city_en: "Frankfurt", country_ar: "ألمانيا" },
  { code: "AMS", city_ar: "أمستردام", city_en: "Amsterdam", country_ar: "هولندا" },
  { code: "FCO", city_ar: "روما", city_en: "Rome", country_ar: "إيطاليا" },
  { code: "MAD", city_ar: "مدريد", city_en: "Madrid", country_ar: "إسبانيا" },
  { code: "VIE", city_ar: "فيينا", city_en: "Vienna", country_ar: "النمسا" },
  { code: "SVO", city_ar: "موسكو", city_en: "Moscow", country_ar: "روسيا" },
  { code: "DEL", city_ar: "دلهي", city_en: "New Delhi", country_ar: "الهند" },
  { code: "BOM", city_ar: "مومباي", city_en: "Mumbai", country_ar: "الهند" },
  { code: "KUL", city_ar: "كوالالمبور", city_en: "Kuala Lumpur", country_ar: "ماليزيا" },
  { code: "BKK", city_ar: "بانكوك", city_en: "Bangkok", country_ar: "تايلاند" },
  { code: "CAN", city_ar: "قوانغتشو", city_en: "Guangzhou", country_ar: "الصين" },
  { code: "PEK", city_ar: "بكين", city_en: "Beijing", country_ar: "الصين" },
  { code: "JNB", city_ar: "جوهانسبرغ", city_en: "Johannesburg", country_ar: "جنوب أفريقيا" },
];

/** يبحث عن مطارات مطابقة (رمز/مدينة عربي/مدينة إنجليزي) لنص إدخال حر. */
export function searchAirports(query: string): Airport[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];
  return AIRPORTS.filter(
    (airport) =>
      airport.code.toLowerCase().includes(trimmed) ||
      airport.city_en.toLowerCase().includes(trimmed) ||
      airport.city_ar.includes(query.trim()),
  ).slice(0, 8);
}
