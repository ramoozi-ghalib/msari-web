/**
 * rate-limiter.ts — إعداد تحديد معدل الطلبات باستخدام Upstash Redis.
 *
 * لماذا Upstash؟
 *  - يعمل عبر HTTP (لا TCP) — يدعم Edge Runtime والـ Node.js.
 *  - Serverless-first: لا يحتفظ باتصالات مفتوحة — مناسب لـ Vercel.
 *  - Sliding Window: أدق من Fixed Window ويمنع الهجمات عند حدود النافذة.
 *
 * استراتيجية المفاتيح (Keys):
 *  - تسجيل الدخول: email:ip  ← يمنع الهجوم على حساب معيّن
 *  - تسجيل الدخول: ip        ← يمنع الهجوم السريع عبر تدوير الإيميلات
 *  - إجراءات الأدمين: userId ← يحمي من جلسة مسروقة تُستخدم آلياً
 *  - رفع الملفات: userId     ← يمنع استنزاف Supabase Storage
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ─── Upstash جاهز؟ ────────────────────────────────────────────────────────────
// إذا لم تُضبط المتغيرات — نستخدم Fallback يمرر الطلبات (بمعنى لا تحديد).
// هذا يمنع تعطل التطبيق في بيئة التطوير قبل إعداد Upstash.
// في الإنتاج: تأكد أن UPSTASH_REDIS_REST_URL و TOKEN موجودان دائماً.
const upstashConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !process.env.UPSTASH_REDIS_REST_URL.startsWith('REPLACE_ME') &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.startsWith('REPLACE_ME');

if (!upstashConfigured && process.env.NODE_ENV === 'production') {
  // في الإنتاج: غياب Upstash يعني غياب الحماية من DoS — هذا خطر
  console.error(
    '[rate-limiter] ⚠️  UPSTASH_REDIS_REST_URL or TOKEN not set in production! ' +
    'Rate limiting is DISABLED. Configure Upstash immediately.'
  );
}

// ─── Fallback Limiter (يمرر كل الطلبات) ──────────────────────────────────────
// يُستخدم عند غياب Upstash — يتيح العمل الطبيعي في التطوير.
class PassthroughLimiter {
  async limit(_key: string) {
    return { success: true, limit: 0, remaining: 999, reset: 0, pending: Promise.resolve() };
  }
}

// ─── اتصال Redis (مشروط) ──────────────────────────────────────────────────────
// يُنشأ فقط إذا كانت المتغيرات مُضبوطة — يمنع TypeScript error على القيم الفارغة
const redis = upstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// ─── دالة مساعدة لإنشاء Limiter أو Passthrough ───────────────────────────────
function makeLimiter(
  window: `${number} ${'s' | 'm' | 'h' | 'd'}`,
  max: number,
  prefix: string
): { limit: (key: string) => Promise<{ success: boolean; remaining: number }> } {
  if (!redis) return new PassthroughLimiter();

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix: `msari:${prefix}`,
    analytics: true, // يُسجِّل في Upstash Dashboard للمراقبة
  });
}

// ─── 1. تحديد محاولات تسجيل الدخول (per email + IP) ─────────────────────────
// الحد: 5 محاولات كل 15 دقيقة — يمنع Brute Force على حساب بعينه
export const loginEmailIpLimiter = makeLimiter('15 m', 5, 'login:email-ip');

// ─── 2. تحديد محاولات تسجيل الدخول (per IP فقط) ─────────────────────────────
// الحد: 20 محاولة كل ساعة — يمنع تدوير الإيميلات لتجاوز الحد الأول
export const loginIpLimiter = makeLimiter('1 h', 20, 'login:ip');

// ─── 3. تحديد إجراءات الأدمين (per userId) ──────────────────────────────────
// الحد: 200 عملية/ساعة — يتيح العمل الطبيعي لكن يوقف الأتمتة المتسارعة
export const adminActionLimiter = makeLimiter('1 h', 200, 'action:admin');

// ─── 4. تحديد رفع الملفات (per userId) ──────────────────────────────────────
// الحد: 30 رفع/ساعة — أقل من العمليات العامة لأن الرفع أكثر تكلفةً
export const uploadLimiter = makeLimiter('1 h', 30, 'upload');



// ─── استجابة الرفض الموحَّدة ─────────────────────────────────────────────────
export const RATE_LIMIT_RESPONSE = {
  success: false as const,
  error: {
    code: 'RATE_LIMITED' as const,
    message: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار قبل المحاولة مجدداً.',
  },
};

// ─── دالة مساعدة لاستخراج IP من الطلب ──────────────────────────────────────
// تعمل مع: Vercel, Cloudflare, Nginx, localhost
export function getClientIp(headersList: Headers): string {
  // x-forwarded-for قد يحتوي على قائمة IPs مفصولة بفواصل — نأخذ الأول
  const forwarded = headersList.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return (
    headersList.get('x-real-ip') ??
    headersList.get('cf-connecting-ip') ?? // Cloudflare
    '127.0.0.1'
  );
}
