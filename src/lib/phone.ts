export interface CountryDialCode {
  code: string;
  nameAr: string;
  nameEn: string;
}

/**
 * Shared country dial codes (default Yemen) — used across registration
 * and post-OAuth account verification forms for parity with the mobile app.
 */
export const COUNTRY_DIAL_CODES: ReadonlyArray<CountryDialCode> = [
  { code: '+967', nameAr: 'اليمن', nameEn: 'Yemen' },
  { code: '+966', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  { code: '+971', nameAr: 'الإمارات', nameEn: 'UAE' },
  { code: '+974', nameAr: 'قطر', nameEn: 'Qatar' },
  { code: '+965', nameAr: 'الكويت', nameEn: 'Kuwait' },
  { code: '+973', nameAr: 'البحرين', nameEn: 'Bahrain' },
  { code: '+968', nameAr: 'عُمان', nameEn: 'Oman' },
  { code: '+20', nameAr: 'مصر', nameEn: 'Egypt' },
  { code: '+962', nameAr: 'الأردن', nameEn: 'Jordan' },
  { code: '+961', nameAr: 'لبنان', nameEn: 'Lebanon' },
  { code: '+963', nameAr: 'سوريا', nameEn: 'Syria' },
  { code: '+964', nameAr: 'العراق', nameEn: 'Iraq' },
  { code: '+970', nameAr: 'فلسطين', nameEn: 'Palestine' },
  { code: '+249', nameAr: 'السودان', nameEn: 'Sudan' },
  { code: '+218', nameAr: 'ليبيا', nameEn: 'Libya' },
  { code: '+216', nameAr: 'تونس', nameEn: 'Tunisia' },
  { code: '+213', nameAr: 'الجزائر', nameEn: 'Algeria' },
  { code: '+212', nameAr: 'المغرب', nameEn: 'Morocco' },
  { code: '+222', nameAr: 'موريتانيا', nameEn: 'Mauritania' },
  { code: '+252', nameAr: 'الصومال', nameEn: 'Somalia' },
  { code: '+253', nameAr: 'جيبوتي', nameEn: 'Djibouti' },
  { code: '+269', nameAr: 'جزر القمر', nameEn: 'Comoros' },
  { code: '+251', nameAr: 'إثيوبيا', nameEn: 'Ethiopia' },
  { code: '+291', nameAr: 'إريتريا', nameEn: 'Eritrea' },
  { code: '+254', nameAr: 'كينيا', nameEn: 'Kenya' },
  { code: '+90', nameAr: 'تركيا', nameEn: 'Turkey' },
  { code: '+98', nameAr: 'إيران', nameEn: 'Iran' },
  { code: '+91', nameAr: 'الهند', nameEn: 'India' },
  { code: '+92', nameAr: 'باكستان', nameEn: 'Pakistan' },
  { code: '+880', nameAr: 'بنغلاديش', nameEn: 'Bangladesh' },
  { code: '+63', nameAr: 'الفلبين', nameEn: 'Philippines' },
  { code: '+62', nameAr: 'إندونيسيا', nameEn: 'Indonesia' },
  { code: '+60', nameAr: 'ماليزيا', nameEn: 'Malaysia' },
  { code: '+66', nameAr: 'تايلند', nameEn: 'Thailand' },
  { code: '+86', nameAr: 'الصين', nameEn: 'China' },
  { code: '+1', nameAr: 'أمريكا / كندا', nameEn: 'US / Canada' },
  { code: '+44', nameAr: 'بريطانيا', nameEn: 'UK' },
  { code: '+33', nameAr: 'فرنسا', nameEn: 'France' },
  { code: '+49', nameAr: 'ألمانيا', nameEn: 'Germany' },
  { code: '+31', nameAr: 'هولندا', nameEn: 'Netherlands' },
  { code: '+46', nameAr: 'السويد', nameEn: 'Sweden' },
  { code: '+34', nameAr: 'إسبانيا', nameEn: 'Spain' },
  { code: '+39', nameAr: 'إيطاليا', nameEn: 'Italy' },
  { code: '+7', nameAr: 'روسيا', nameEn: 'Russia' },
  { code: '+61', nameAr: 'أستراليا', nameEn: 'Australia' },
  { code: '+27', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa' },
  { code: '+234', nameAr: 'نيجيريا', nameEn: 'Nigeria' },
];

/**
 * Convert Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits to ASCII 0-9.
 */
export function normalizeArabicDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Combine a country dial code with a user-entered national phone number.
 * A manually entered international prefix (`+...` or `00...`) overrides `dialCode`.
 */
export function composeE164Phone(dialCode: string, nationalInput: string): string {
  const cleaned = normalizeArabicDigits(nationalInput)
    .trim()
    .replace(/[\s\-.()]/g, '');

  if (cleaned.startsWith('00')) {
    return `+${cleaned.slice(2)}`;
  }
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  return `${dialCode}${cleaned.replace(/^0+/, '')}`;
}

/**
 * Normalize user-entered phone to strict E.164 (UI/action boundary).
 *
 * - converts Arabic-Indic digits to ASCII and strips spaces, dashes, dots, parentheses
 * - '00...' (IDD prefix) -> '+...'
 * - leading '+' kept as-is when 7–15 digits
 * - bare '967XXXXXXXXX' -> '+967XXXXXXXXX'
 * - bare Yemeni national '7XXXXXXXX' (9 digits) -> '+9677XXXXXXXX'
 * Returns null when unparseable so callers fail closed.
 */
export function normalizePhoneE164(raw: string | undefined): string | null {
  if (!raw) return null;
  let p = normalizeArabicDigits(raw).trim().replace(/[\s\-.()]/g, '');
  if (!p) return null;
  if (p.startsWith('00')) p = '+' + p.slice(2);
  if (p.startsWith('+')) return /^\+\d{7,15}$/.test(p) ? p : null;
  const digits = p.replace(/\D/g, '');
  if (/^967\d{9}$/.test(digits)) return '+' + digits;
  if (/^7\d{8}$/.test(digits)) return '+967' + digits;
  return null;
}
