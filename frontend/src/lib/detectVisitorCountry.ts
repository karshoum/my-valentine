// File: frontend/src/lib/detectVisitorCountry.ts

const GEOLOCATION_API_URL = "https://ipwho.is/";

/** يكتشف رمز دولة الزائر الحالي (ISO Alpha-2) عبر IP من متصفحه مباشرة، أو null إن تعذّر ذلك. */
export async function detectVisitorCountryCode(): Promise<string | null> {
  try {
    const response = await fetch(GEOLOCATION_API_URL);
    const data: { country_code?: string } = await response.json();
    return data.country_code ?? null;
  } catch {
    return null;
  }
}
