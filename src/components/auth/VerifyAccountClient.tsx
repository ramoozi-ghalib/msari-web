'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  LogOut,
  Info,
  Phone,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import {
  requestEmailVerificationOtp,
  verifyEmailVerificationOtp,
} from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';
import { Button } from '@/components/ui/Button';
import AuthVisualSide from '@/components/auth/AuthVisualSide';

export interface VerifyAccountClientProps {
  email: string;
  pendingPhone?: string;
  needsPhone?: boolean;
  redirectTo: string;
  autoSend: boolean;
  locale: string;
  alreadyVerifiedOnServer?: boolean;
}

const OTP_LENGTH = 6;
const DEFAULT_COOLDOWN_SEC = 60;

const COUNTRY_DIAL_CODES: Array<{ code: string; nameAr: string; nameEn: string }> = [
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
  { code: '+90', nameAr: 'تركيا', nameEn: 'Turkey' },
  { code: '+91', nameAr: 'الهند', nameEn: 'India' },
  { code: '+92', nameAr: 'باكستان', nameEn: 'Pakistan' },
  { code: '+60', nameAr: 'ماليزيا', nameEn: 'Malaysia' },
  { code: '+62', nameAr: 'إندونيسيا', nameEn: 'Indonesia' },
  { code: '+1', nameAr: 'أمريكا / كندا', nameEn: 'US / Canada' },
  { code: '+44', nameAr: 'بريطانيا', nameEn: 'UK' },
  { code: '+33', nameAr: 'فرنسا', nameEn: 'France' },
  { code: '+49', nameAr: 'ألمانيا', nameEn: 'Germany' },
];

/**
 * Normalize Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits to ASCII 0-9
 * and strip any non-digit characters.
 */
function normalizeDigits(input: string): string {
  return input
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, '');
}

function maskEmailFallback(email: string): string {
  const trimmed = email.trim();
  const atIdx = trimmed.indexOf('@');
  if (atIdx <= 1) return trimmed;
  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${'*'.repeat(Math.max(2, local.length - visible.length))}${domain}`;
}

function readCooldownExpiry(key: string): number {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return 0;
    const expiryMs = Number(raw);
    if (!Number.isFinite(expiryMs) || expiryMs <= Date.now()) {
      window.sessionStorage.removeItem(key);
      return 0;
    }
    return expiryMs;
  } catch {
    return 0;
  }
}

function writeCooldownExpiry(key: string, expiryMs: number): void {
  try {
    window.sessionStorage.setItem(key, String(expiryMs));
  } catch {
    // Ignore storage errors (e.g. private browsing restrictions)
  }
}

function clearCooldownExpiry(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

export default function VerifyAccountClient({
  email,
  pendingPhone,
  needsPhone = false,
  redirectTo,
  autoSend,
  locale,
  alreadyVerifiedOnServer = false,
}: VerifyAccountClientProps) {
  const isEn = locale === 'en';
  const safeLocale = isEn ? 'en' : 'ar';
  const safeRedirect = getSafeRedirect(redirectTo);
  const storageKey = `msari_otp_cooldown_${email.trim().toLowerCase()}`;

  const { update, status: sessionStatus } = useSession();

  const [step, setStep] = useState<'phone' | 'otp'>(
    needsPhone && !alreadyVerifiedOnServer ? 'phone' : 'otp'
  );
  const [dialCode, setDialCode] = useState<string>('+967');
  const [nationalPhone, setNationalPhone] = useState<string>('');
  const [activePhone, setActivePhone] = useState<string>(pendingPhone || '');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [maskedEmail, setMaskedEmail] = useState<string>(() => maskEmailFallback(email));
  const [sending, setSending] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(alreadyVerifiedOnServer);
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');
  const [cooldownSec, setCooldownSec] = useState<number>(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const didInitSendRef = useRef<boolean>(false);
  const didSyncVerifiedRef = useRef<boolean>(false);
  const verifyingRef = useRef<boolean>(false);
  const sendingRef = useRef<boolean>(false);
  const cooldownUntilRef = useRef<number>(0);
  const sessionStatusRef = useRef(sessionStatus);
  const updateRef = useRef(update);

  useEffect(() => {
    sessionStatusRef.current = sessionStatus;
    updateRef.current = update;
  }, [sessionStatus, update]);

  const copy = isEn
    ? {
        brand: 'Msari',
        home: 'Home',
        title: 'Verify Your Account',
        subtitle:
          'We sent a 6-digit verification code to your email to secure your account and unlock bookings.',
        emailLabel: 'Verification code sent to',
        pendingPhoneNote: 'Activating your account will also verify your phone:',
        otpLabel: 'Enter the 6-digit verification code',
        digitAria: (i: number) => `Verification code digit ${i + 1} of ${OTP_LENGTH}`,
        submitBtn: 'Verify & Activate Account',
        verifyingBtn: 'Verifying...',
        resendBtn: 'Resend code',
        sendingBtn: 'Sending code...',
        resendIn: (sec: number) => `Resend available in ${sec}s`,
        codeSentInfo: (target: string) =>
          `A 6-digit verification code has been sent to ${target}.`,
        activeCodeInfo:
          'A verification code was recently sent to your email. Please enter it below or wait for the timer to request a new one.',
        incompleteError: 'Please enter all 6 digits of the verification code.',
        genericSendError: 'Could not send verification code. Please try again.',
        genericVerifyError: 'Invalid or expired verification code. Please try again.',
        successTitle: 'Account verified successfully!',
        successSubtitle: 'Refreshing your session and redirecting you now...',
        syncingTitle: 'Your account is already verified!',
        syncingSubtitle: 'Updating your session and taking you straight back...',
        spamTip:
          "Didn't receive the code? Check your Spam / Junk or Promotions folder.",
        switchAccount: 'Switch account / Sign out',
        signingOut: 'Signing out...',
        rights: `© ${new Date().getFullYear()} Msari Travel & Tourism.`,
        secureFooter: '100% secure & encrypted verification',
        visualBadge: 'Account Security & Protection',
        visualHeadline: 'One quick step to unlock instant hotel bookings',
        visualSubheadline:
          'Verifying your email protects your account and ensures instant booking confirmations and updates reach you reliably.',
      }
    : {
        brand: 'مساري',
        home: 'الرئيسية',
        title: 'تفعيل حسابك',
        subtitle:
          'أرسلنا رمز تحقق مكوّن من 6 أرقام إلى بريدك الإلكتروني لتأمين حسابك وتفعيل إمكانية الحجز.',
        emailLabel: 'تم إرسال رمز التحقق إلى',
        pendingPhoneNote: 'تفعيل الحساب سيؤكد أيضاً رقم هاتفك المسجّل:',
        otpLabel: 'أدخل رمز التحقق المكوّن من 6 أرقام',
        digitAria: (i: number) => `الرقم ${i + 1} من ${OTP_LENGTH} لرمز التحقق`,
        submitBtn: 'تأكيد وتفعيل الحساب',
        verifyingBtn: 'جارٍ التحقق...',
        resendBtn: 'إعادة إرسال الرمز',
        sendingBtn: 'جارٍ إرسال الرمز...',
        resendIn: (sec: number) => `إعادة الإرسال خلال ${sec} ثانية`,
        codeSentInfo: (target: string) =>
          `تم إرسال رمز تحقق من 6 أرقام إلى ${target}.`,
        activeCodeInfo:
          'لديك رمز تحقق نشط تم إرساله مؤخراً إلى بريدك الإلكتروني. أدخله أدناه أو انتظر انتهاء العدّاد لطلب رمز جديد.',
        incompleteError: 'يرجى إدخال رمز التحقق المكوّن من 6 أرقام بالكامل.',
        genericSendError: 'تعذر إرسال رمز التحقق، يرجى المحاولة مرة أخرى.',
        genericVerifyError: 'رمز التحقق غير صحيح أو منتهي الصلاحية، يرجى المحاولة مجدداً.',
        successTitle: 'تم تفعيل حسابك بنجاح!',
        successSubtitle: 'جارٍ تحديث جلستك ونقلك الآن...',
        syncingTitle: 'حسابك مفعّل بالفعل!',
        syncingSubtitle: 'جارٍ مزامنة جلستك ونقلك مباشرة...',
        spamTip:
          'لم يصلك الرمز؟ يرجى التحقق من مجلد الرسائل غير المرغوب فيها (Spam / Junk) أو العروض الترويجية.',
        switchAccount: 'تغيير الحساب / تسجيل الخروج',
        signingOut: 'جارٍ تسجيل الخروج...',
        rights: `© ${new Date().getFullYear()} مساري لخدمات السفر والسياحة.`,
        secureFooter: 'تفعيل آمن ومشفر 100%',
        visualBadge: 'حماية وأمان حسابك',
        visualHeadline: 'خطوة سريعة لإتمام تفعيل حسابك وحجوزاتك',
        visualSubheadline:
          'توثيق بريدك الإلكتروني يحمي حسابك ويضمن وصول تأكيدات الحجز الفندقي والتنبيهات المهمة إليك فوراً.',
      };

  const startCooldown = useCallback(
    (seconds: number) => {
      const safeSec = Math.max(1, Math.ceil(seconds));
      const expiryMs = Date.now() + safeSec * 1000;
      cooldownUntilRef.current = expiryMs;
      writeCooldownExpiry(storageKey, expiryMs);
      setCooldownSec(safeSec);
    },
    [storageKey]
  );

  const completeVerificationAndRedirect = useCallback(async () => {
    clearCooldownExpiry(storageKey);
    cooldownUntilRef.current = 0;
    setCooldownSec(0);
    setError('');
    setInfo('');
    setVerified(true);

    try {
      // Wait for SessionProvider to finish initial hydration so update() does not no-op
      for (let i = 0; i < 40 && sessionStatusRef.current === 'loading'; i += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 100));
      }
      await updateRef.current({ refreshVerification: true });
    } catch {
      // Session refresh error should not block redirect after verified backend state
    }

    window.setTimeout(() => {
      window.location.href = safeRedirect;
    }, 650);
  }, [safeRedirect, storageKey]);

  const sendOtp = useCallback(async (phoneOverride?: string): Promise<boolean> => {
    if (sendingRef.current || verified) return false;
    sendingRef.current = true;
    setSending(true);
    setError('');

    try {
      const phoneArg = phoneOverride ?? (activePhone || undefined);
      const res = await requestEmailVerificationOtp(phoneArg);
      if (res.success) {
        const targetEmail = res.data.maskedEmail || maskEmailFallback(email);
        setMaskedEmail(targetEmail);
        startCooldown(res.data.cooldownSec || DEFAULT_COOLDOWN_SEC);
        setInfo(copy.codeSentInfo(targetEmail));
        window.setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 50);
        return true;
      } else if (res.error.code === 'ALREADY_VERIFIED') {
        await completeVerificationAndRedirect();
        return true;
      } else if (res.error.code === 'COOLDOWN') {
        const retrySec =
          typeof res.error.retryAfterSec === 'number' && res.error.retryAfterSec > 0
            ? res.error.retryAfterSec
            : DEFAULT_COOLDOWN_SEC;
        startCooldown(retrySec);
        setError('');
        setInfo(copy.activeCodeInfo);
        return true;
      } else {
        setInfo('');
        setError(res.error.message || copy.genericSendError);
        if (typeof res.error.retryAfterSec === 'number' && res.error.retryAfterSec > 0) {
          startCooldown(res.error.retryAfterSec);
        }
        return false;
      }
    } catch {
      setInfo('');
      setError(copy.genericSendError);
      return false;
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }, [
    activePhone,
    completeVerificationAndRedirect,
    copy.activeCodeInfo,
    copy.codeSentInfo,
    copy.genericSendError,
    email,
    startCooldown,
    verified,
  ]);

  // Countdown tick synced to wall-clock expiry so mobile tab switches stay accurate
  useEffect(() => {
    if (cooldownSec <= 0) return;

    const timer = window.setInterval(() => {
      const remaining = Math.ceil((cooldownUntilRef.current - Date.now()) / 1000);
      if (remaining <= 0) {
        cooldownUntilRef.current = 0;
        clearCooldownExpiry(storageKey);
        setCooldownSec(0);
      } else {
        setCooldownSec(remaining);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSec, storageKey]);

  // Sync already-verified account once SessionProvider finishes hydrating
  // (next-auth's update() no-ops while sessionStatus === 'loading').
  useEffect(() => {
    if (!alreadyVerifiedOnServer) return;
    if (sessionStatus === 'loading') return;
    if (didSyncVerifiedRef.current) return;
    didSyncVerifiedRef.current = true;
    void completeVerificationAndRedirect();
  }, [alreadyVerifiedOnServer, sessionStatus, completeVerificationAndRedirect]);

  // Initial mount effect with StrictMode double-mount guard
  useEffect(() => {
    if (alreadyVerifiedOnServer || step === 'phone') return;
    if (didInitSendRef.current) return;
    didInitSendRef.current = true;

    const existingExpiry = readCooldownExpiry(storageKey);
    if (existingExpiry > Date.now()) {
      const remaining = Math.ceil((existingExpiry - Date.now()) / 1000);
      cooldownUntilRef.current = existingExpiry;
      setCooldownSec(remaining);
      setInfo(copy.activeCodeInfo);
      window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
      return;
    }

    // Whether autoSend is true or user landed here to finish verification, send once
    void sendOtp();
  }, [
    alreadyVerifiedOnServer,
    autoSend,
    copy.activeCodeInfo,
    sendOtp,
    step,
    storageKey,
  ]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || verified) return;
    setError('');
    setInfo('');

    const rawTrimmed = nationalPhone
      .trim()
      .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
      .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
      .replace(/[\s\-.()]/g, '');

    let fullPhone = rawTrimmed;
    if (fullPhone.startsWith('00')) {
      fullPhone = '+' + fullPhone.slice(2);
    } else if (!fullPhone.startsWith('+')) {
      fullPhone = `${dialCode}${fullPhone.replace(/^0+/, '')}`;
    }

    if (!/^\+[1-9]\d{7,14}$/.test(fullPhone)) {
      setError(
        isEn
          ? 'Please enter a valid phone number (e.g. +9677XXXXXXXX).'
          : 'رقم الهاتف غير صالح — أدخله بالصيغة الدولية (مثال: +9677XXXXXXXX).'
      );
      return;
    }

    setActivePhone(fullPhone);
    didInitSendRef.current = true;
    const sent = await sendOtp(fullPhone);
    if (sent) {
      setStep('otp');
    }
  };

  const verifyCode = useCallback(
    async (codeOverride?: string) => {
      if (verifyingRef.current || verified) return;

      const code = normalizeDigits(codeOverride ?? digits.join('')).slice(0, OTP_LENGTH);
      if (code.length !== OTP_LENGTH) {
        setError(copy.incompleteError);
        const firstEmpty = digits.findIndex((d) => !d);
        inputRefs.current[firstEmpty >= 0 ? firstEmpty : 0]?.focus();
        return;
      }

      verifyingRef.current = true;
      setVerifying(true);
      setError('');

      try {
        const res = await verifyEmailVerificationOtp(code, activePhone || undefined);
        if (res.success || (!res.success && res.error.code === 'ALREADY_VERIFIED')) {
          await completeVerificationAndRedirect();
          return;
        }
        setError(res.error.message || copy.genericVerifyError);
      } catch {
        setError(copy.genericVerifyError);
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [
      activePhone,
      completeVerificationAndRedirect,
      copy.genericVerifyError,
      copy.incompleteError,
      digits,
      verified,
    ]
  );

  const handleDigitChange = (index: number, rawValue: string) => {
    if (verifying || verified) return;
    setError('');

    const cleaned = normalizeDigits(rawValue);

    // Handle multi-digit insertion (e.g. mobile OS one-time-code autofill)
    if (cleaned.length > 1) {
      const next = Array(OTP_LENGTH).fill('');
      const slice = cleaned.slice(0, OTP_LENGTH);
      for (let i = 0; i < slice.length; i += 1) {
        next[i] = slice[i];
      }
      setDigits(next);
      const focusIdx = Math.min(slice.length - 1, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      if (slice.length === OTP_LENGTH) {
        void verifyCode(slice);
      }
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (verifying || verified) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      setError('');
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (verifying || verified) return;
    setError('');

    const pasted = normalizeDigits(e.clipboardData.getData('text'));
    if (!pasted) return;

    const next = [...digits];
    if (pasted.length >= OTP_LENGTH) {
      const full = pasted.slice(0, OTP_LENGTH);
      for (let i = 0; i < OTP_LENGTH; i += 1) {
        next[i] = full[i];
      }
      setDigits(next);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      void verifyCode(full);
      return;
    }

    // Partial paste fills from current index onward
    let lastFilled = index;
    for (let i = 0; i < pasted.length && index + i < OTP_LENGTH; i += 1) {
      next[index + i] = pasted[i];
      lastFilled = index + i;
    }
    setDigits(next);

    const nextFocus = Math.min(lastFilled + 1, OTP_LENGTH - 1);
    inputRefs.current[nextFocus]?.focus();

    const joined = next.join('');
    if (joined.length === OTP_LENGTH && next.every((d) => d.length === 1)) {
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      void verifyCode(joined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void verifyCode();
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    clearCooldownExpiry(storageKey);
    await signOut({ callbackUrl: `/${safeLocale}/login` });
  };

  const isCodeComplete = digits.every((d) => /^\d$/.test(d));

  return (
    <div
      dir={isEn ? 'ltr' : 'rtl'}
      className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white"
    >
      {/* ── Interactive Verification Column ── */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Top Bar: Logo & Home Link */}
        <div className="flex items-center justify-between pb-6">
          <Link href={`/${safeLocale}`} className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 p-2 border border-[var(--brand-primary)]/15 flex items-center justify-center transition-transform group-hover:scale-105">
              <Image
                src="/images/logo-dark.png"
                alt={copy.brand}
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <span className="font-black text-xl text-neutral-900 tracking-tight">
              {copy.brand}
            </span>
          </Link>

          <Link
            href={`/${safeLocale}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-neutral-500 hover:text-[var(--brand-primary)] transition-colors bg-neutral-50 hover:bg-neutral-100 px-3.5 py-1.5 rounded-full"
          >
            {copy.home} <ArrowRight size={14} className="rtl:rotate-180" />
          </Link>
        </div>

        {/* Middle Verification Area */}
        <div className="my-auto py-6 max-w-md w-full mx-auto">
          {/* Header Badge & Title */}
          <div className="mb-7">
            <div className="w-14 h-14 rounded-2xl bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/15 text-[var(--brand-primary)] flex items-center justify-center mb-5 shadow-sm">
              {step === 'phone' ? <Phone size={26} /> : <Mail size={26} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2.5">
              {step === 'phone'
                ? isEn
                  ? 'Add Your Phone Number'
                  : 'أضف رقم هاتفك لإكمال التفعيل'
                : copy.title}
            </h1>
            <p className="text-neutral-500 text-sm leading-relaxed">
              {step === 'phone'
                ? isEn
                  ? 'Enter your phone number so hotels can reach you for bookings, then verify with a 6-digit code sent to your email.'
                  : 'أدخل رقم هاتفك للتواصل وتأكيد الحجوزات، ثم أكمل التفعيل عبر رمز التحقق المكوّن من 6 أرقام المرسل إلى بريدك الإلكتروني.'
                : copy.subtitle}
            </p>
          </div>

          {/* Target Email & Optional Pending Phone Summary */}
          {!verified && (
            <div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-4 mb-6 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-neutral-500">
                  {step === 'phone'
                    ? isEn
                      ? 'Signed in as'
                      : 'البريد الإلكتروني المرتبط'
                    : copy.emailLabel}
                </span>
                <span
                  dir="ltr"
                  className="text-sm font-black text-neutral-900 break-all"
                >
                  {step === 'phone' ? email : maskedEmail || email}
                </span>
              </div>
              {activePhone && step === 'otp' && (
                <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between gap-2 flex-wrap text-xs text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} className="text-[var(--brand-primary)] shrink-0" />
                    {copy.pendingPhoneNote}
                  </span>
                  <div className="flex items-center gap-2">
                    <span dir="ltr" className="font-bold text-neutral-700">
                      {activePhone}
                    </span>
                    {needsPhone && (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setInfo('');
                          setStep('phone');
                        }}
                        className="text-[var(--brand-primary)] font-bold hover:underline cursor-pointer"
                      >
                        {isEn ? 'Change' : 'تعديل'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success Banner */}
          {verified && (
            <div
              role="status"
              aria-live="polite"
              className="flex flex-col items-center text-center gap-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 rounded-2xl p-6 mb-6 shadow-sm animate-in fade-in zoom-in-95 duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={32} />
              </div>
              <div className="text-lg font-black">
                {alreadyVerifiedOnServer ? copy.syncingTitle : copy.successTitle}
              </div>
              <p className="text-sm text-emerald-700 font-medium">
                {alreadyVerifiedOnServer ? copy.syncingSubtitle : copy.successSubtitle}
              </p>
              <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mt-1" />
            </div>
          )}

          {/* Error Banner */}
          {error && !verified && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-2.5 bg-red-50 border border-red-200/80 text-red-700 rounded-2xl p-4 mb-5 text-sm shadow-sm animate-in fade-in duration-200"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div className="font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Info Banner */}
          {info && !error && !verified && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-start gap-2.5 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/15 text-neutral-700 rounded-2xl p-4 mb-5 text-sm animate-in fade-in duration-200"
            >
              <Info size={18} className="shrink-0 mt-0.5 text-[var(--brand-primary)]" />
              <div className="font-medium leading-relaxed">{info}</div>
            </div>
          )}

          {/* Step 1: Phone Entry Form (for Google Sign-In users without a phone number) */}
          {!verified && step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="verify-phone"
                  className="block text-xs sm:text-sm font-bold text-neutral-800 mb-1.5"
                >
                  {isEn ? 'Phone Number' : 'رقم الهاتف'}
                </label>
                <div className="flex gap-2" dir="ltr">
                  <select
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    aria-label={isEn ? 'Country dial code' : 'رمز الدولة'}
                    className="rounded-xl border border-neutral-200 bg-neutral-50/50 px-2 py-3 text-sm text-neutral-900 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none max-w-36"
                  >
                    {COUNTRY_DIAL_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {isEn ? c.nameEn : c.nameAr} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Phone size={18} />
                    </div>
                    <input
                      id="verify-phone"
                      type="tel"
                      value={nationalPhone}
                      onChange={(e) => {
                        setError('');
                        setNationalPhone(e.target.value);
                      }}
                      placeholder="7XX XXX XXX"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      dir="ltr"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 ps-10 pe-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/10 transition-all outline-none"
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
                  {isEn
                    ? 'Select your country code and enter your local number without the leading zero.'
                    : 'اختر رمز الدولة ثم أدخل رقمك بدون الصفر الأول (أو اكتبه كاملاً بصيغة +...).'}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={sending}
                disabled={sending || !nationalPhone.trim()}
                icon={<ShieldCheck size={18} />}
                className="py-3.5 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-bold"
              >
                {sending
                  ? copy.sendingBtn
                  : isEn
                    ? 'Continue & Send Verification Code'
                    : 'متابعة وإرسال رمز التحقق'}
              </Button>
            </form>
          )}

          {/* Step 2: 6-Digit OTP Form */}
          {!verified && step === 'otp' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-neutral-800 mb-3 text-center">
                  {copy.otpLabel}
                </label>

                <div
                  dir="ltr"
                  className="flex items-center justify-center gap-2 sm:gap-2.5"
                >
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      aria-label={copy.digitAria(index)}
                      value={digit}
                      disabled={verifying || verified}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={(e) => handlePaste(index, e)}
                      onFocus={(e) => e.currentTarget.select()}
                      className={`h-13 sm:h-14 w-11 sm:w-12 text-center text-xl font-black rounded-xl border transition-all outline-none ${
                        digit
                          ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 text-neutral-900'
                          : 'border-neutral-200 bg-neutral-50/50 text-neutral-900'
                      } focus:bg-white focus:border-[var(--brand-primary)] focus:ring-4 focus:ring-[var(--brand-primary)]/15 disabled:opacity-60`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={verifying}
                disabled={verifying || !isCodeComplete}
                icon={<ShieldCheck size={18} />}
                className="py-3.5 shadow-lg shadow-[var(--brand-primary)]/20 hover:shadow-[var(--brand-primary)]/30 font-bold"
              >
                {verifying ? copy.verifyingBtn : copy.submitBtn}
              </Button>

              {/* Resend OTP Controls */}
              <div className="text-center space-y-3">
                {cooldownSec > 0 ? (
                  <p className="text-xs sm:text-sm font-semibold text-neutral-500">
                    {copy.resendIn(cooldownSec)}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void sendOtp()}
                    disabled={sending || verifying}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[var(--brand-primary)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw size={15} className={sending ? 'animate-spin' : ''} />
                    <span>{sending ? copy.sendingBtn : copy.resendBtn}</span>
                  </button>
                )}

                {/* Spam/Junk Folder Tip */}
                <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-100">
                  {copy.spamTip}
                </p>
              </div>
            </form>
          )}

          {/* Switch Account / Sign Out Link */}
          {!verified && (
            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                disabled={signingOut || verifying}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-bold text-neutral-500 hover:text-red-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <LogOut size={15} />
                <span>{signingOut ? copy.signingOut : copy.switchAccount}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Legal Footer */}
        <div className="pt-6 border-t border-neutral-100/80 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
          <span>{copy.rights}</span>
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{copy.secureFooter}</span>
          </div>
        </div>
      </div>

      {/* ── Visual Showcase Side Column ── */}
      <AuthVisualSide
        badgeText={copy.visualBadge}
        headline={copy.visualHeadline}
        subheadline={copy.visualSubheadline}
      />
    </div>
  );
}
