'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Check, Copy, Download, ExternalLink, Sparkles, X } from 'lucide-react';

const DISMISS_STORAGE_KEY = 'msari_pwa_install_dismissed_at';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const SHOW_DELAY_MS = 1500;
const HIDDEN_ROUTE_PREFIXES = ['/admin', '/login', '/register', '/booking'] as const;

/**
 * Matches iOS in-app webviews and non-Safari iOS browsers where direct
 * Safari "Add to Home Screen" is unavailable or unreliable.
 */
const IOS_IN_APP_OR_NON_SAFARI_RE =
  /WhatsApp|Instagram|FBAN|FBAV|FB_IAB|Snapchat|Bytedance|TikTok|musical_ly|Twitter|LinkedInApp|Line\/|Telegram|CriOS|FxiOS|EdgiOS|OPiOS/i;

export type InstallPromptMode = 'ios-in-app' | 'ios-safari' | 'native-prompt';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneMedia = window.matchMedia?.('(display-mode: standalone)').matches ?? false;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return standaloneMedia || iosStandalone;
}

function isDismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!raw) return false;
    const timestamp = Number(raw);
    if (!Number.isFinite(timestamp)) return false;
    return Date.now() - timestamp < DISMISS_DURATION_MS;
  } catch {
    // Private browsing or restricted storage
    return false;
  }
}

function saveDismissalTimestamp(): void {
  try {
    window.localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors in private browsing
  }
}

function detectIosMode(): 'ios-in-app' | 'ios-safari' | null {
  if (typeof window === 'undefined') return null;
  const ua = window.navigator.userAgent || '';
  const isIos =
    /iphone|ipad|ipod/i.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);

  if (!isIos) return null;

  const isInAppOrNonSafari =
    IOS_IN_APP_OR_NON_SAFARI_RE.test(ua) || !/Safari/i.test(ua);

  return isInAppOrNonSafari ? 'ios-in-app' : 'ios-safari';
}

function isHiddenRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  const normalized = pathname.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
  return HIDDEN_ROUTE_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`)
  );
}

/** Authentic iOS Share icon (box with upward arrow) */
function IosShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

/** Authentic iOS "Add to Home Screen" icon (plus inside rounded square) */
function IosAddToHomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function InstallPromptBanner() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) === 'en' ? 'en' : 'ar';
  const isRtl = locale === 'ar';

  const [mounted, setMounted] = useState(false);
  const [delayElapsed, setDelayElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [mode, setMode] = useState<InstallPromptMode | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);

    if (isStandaloneMode() || isDismissedRecently()) {
      setDismissed(true);
      return;
    }

    const iosMode = detectIosMode();
    if (iosMode) {
      setMode(iosMode);
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      // Only switch to native-prompt if not already in iOS mode
      if (!detectIosMode()) {
        setMode('native-prompt');
      }
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setDismissed(true);
      setSheetOpen(false);
      saveDismissalTimestamp();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const delayTimer = window.setTimeout(() => {
      setDelayElapsed(true);
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.clearTimeout(delayTimer);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // Close iOS guide sheet on Escape
  useEffect(() => {
    if (!sheetOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheetOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheetOpen]);

  const handleDismiss = useCallback(() => {
    saveDismissalTimestamp();
    setSheetOpen(false);
    setDismissed(true);
  }, []);

  const handleCopyLink = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        success = true;
      }
    } catch {
      success = false;
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textarea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    }
  }, []);

  const handleNativeInstall = useCallback(async () => {
    const promptEvent = deferredPromptRef.current;
    if (!promptEvent || installing) return;

    setInstalling(true);
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      deferredPromptRef.current = null;
      if (choice.outcome === 'accepted') {
        saveDismissalTimestamp();
        setDismissed(true);
      } else {
        // User dismissed the browser prompt; suppress banner cleanly
        saveDismissalTimestamp();
        setDismissed(true);
      }
    } catch {
      // Ignore prompt errors
    } finally {
      setInstalling(false);
    }
  }, [installing]);

  if (!mounted || !delayElapsed || dismissed || !mode || isHiddenRoute(pathname)) {
    return null;
  }

  const copy = isRtl
    ? {
        closeLabel: 'إغلاق إشعار التثبيت',
        inAppTitle: 'ثبّت تطبيق مساري على الآيفون',
        inAppDesc: 'افتح هذا الرابط في متصفح Safari أولاً لتتمكن من تثبيت التطبيق',
        copyLink: 'نسخ الرابط',
        copied: 'تم النسخ ✓',
        inAppHint: 'اضغط ⋯ ثم فتح في Safari',
        safariTitle: 'أضف مساري للشاشة الرئيسية',
        safariDesc: 'وصول أسرع وتجربة تطبيق متكاملة',
        safariCta: 'كيف أثبّته؟',
        nativeTitle: 'ثبّت تطبيق مساري',
        nativeDesc: 'حجز أسرع ووصول فوري من شاشتك الرئيسية',
        nativeCta: 'تثبيت',
        nativeInstalling: 'جاري التثبيت...',
        sheetBadge: 'دليل التثبيت السريع',
        sheetTitle: 'أضف مساري إلى الشاشة الرئيسية',
        sheetSubtitle: 'خطوتان بسيطتان لتجربة تطبيق كاملة على الآيفون بدون متجر',
        step1Label: 'الخطوة ١',
        step1Text: 'اضغط على زر المشاركة في أسفل متصفح Safari',
        step2Label: 'الخطوة ٢',
        step2Text: 'اختر «إضافة إلى الشاشة الرئيسية» ثم اضغط «إضافة»',
        sheetDone: 'حسناً، فهمت',
        sheetFooterHint: 'ابحث عن أيقونة المشاركة في شريط Safari بالأسفل',
      }
    : {
        closeLabel: 'Dismiss install banner',
        inAppTitle: 'Install Msari on iPhone',
        inAppDesc: 'Open this link in Safari first to install the app',
        copyLink: 'Copy Link',
        copied: 'Copied ✓',
        inAppHint: 'Tap ⋯ then Open in Safari',
        safariTitle: 'Add Msari to Home Screen',
        safariDesc: 'Faster access & full app experience',
        safariCta: 'How to Install',
        nativeTitle: 'Install Msari App',
        nativeDesc: 'Faster booking & instant access from your home screen',
        nativeCta: 'Install',
        nativeInstalling: 'Installing...',
        sheetBadge: 'Quick Install Guide',
        sheetTitle: 'Add Msari to Home Screen',
        sheetSubtitle: 'Two quick steps for a full app experience on iPhone',
        step1Label: 'Step 1',
        step1Text: 'Tap the Share button at the bottom of Safari',
        step2Label: 'Step 2',
        step2Text: 'Choose "Add to Home Screen" then tap "Add"',
        sheetDone: 'Got it',
        sheetFooterHint: 'Look for the Share icon in the Safari toolbar below',
      };

  return (
    <>
      {/* Compact floating glassmorphic install banner */}
      <aside
        dir={isRtl ? 'rtl' : 'ltr'}
        role="region"
        aria-label={
          mode === 'ios-in-app'
            ? copy.inAppTitle
            : mode === 'ios-safari'
              ? copy.safariTitle
              : copy.nativeTitle
        }
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-5 start-3 end-[4.25rem] sm:start-4 sm:end-[4.75rem] lg:start-6 lg:end-auto lg:w-[400px] z-[45] animate-fade-in"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md border border-[#23096E]/12 shadow-[0_14px_34px_-10px_rgba(35,9,110,0.24),0_4px_12px_-4px_rgba(10,9,18,0.08)] p-3 sm:p-3.5">
          {/* Subtle top brand accent bar */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#23096E] via-[#3A1C8F] to-[#FF3B30]"
            aria-hidden="true"
          />

          <div className="flex items-start gap-2.5 sm:gap-3">
            {/* Msari App Icon */}
            <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#23096E] to-[#3A1C8F] p-1.5 shadow-sm ring-1 ring-[#23096E]/10 flex items-center justify-center">
              <img
                src="/images/logo-icon.png"
                alt="Msari"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] sm:text-sm font-extrabold text-[#23096E] leading-snug">
                  {mode === 'ios-in-app'
                    ? copy.inAppTitle
                    : mode === 'ios-safari'
                      ? copy.safariTitle
                      : copy.nativeTitle}
                </p>

                <button
                  type="button"
                  onClick={handleDismiss}
                  aria-label={copy.closeLabel}
                  className="shrink-0 -mt-0.5 -me-1 p-1 rounded-full text-[#5c4f82] hover:text-[#23096E] hover:bg-[#23096E]/8 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-0.5 text-[11.5px] sm:text-xs text-[#423861] leading-relaxed">
                {mode === 'ios-in-app'
                  ? copy.inAppDesc
                  : mode === 'ios-safari'
                    ? copy.safariDesc
                    : copy.nativeDesc}
              </p>

              {/* Mode-specific actions */}
              {mode === 'ios-in-app' && (
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                      copied
                        ? 'bg-[#10B981] text-white shadow-sm'
                        : 'bg-[#23096E] hover:bg-[#3A1C8F] text-white shadow-sm'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? copy.copied : copy.copyLink}</span>
                  </button>

                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5c4f82]">
                    <ExternalLink className="w-3 h-3 shrink-0 text-[#3A1C8F]" />
                    <span>{copy.inAppHint}</span>
                  </span>
                </div>
              )}

              {mode === 'ios-safari' && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#23096E] hover:bg-[#3A1C8F] text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <IosShareIcon className="w-3.5 h-3.5" />
                    <span>{copy.safariCta}</span>
                  </button>
                </div>
              )}

              {mode === 'native-prompt' && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNativeInstall}
                    disabled={installing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF3B30] hover:bg-[#e02d23] disabled:opacity-60 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{installing ? copy.nativeInstalling : copy.nativeCta}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mode B Expanded Visual 2-Step iOS Safari Install Sheet */}
      {mode === 'ios-safari' && sheetOpen && (
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="msari-ios-install-sheet-title"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#0A0912]/55 backdrop-blur-[2px] transition-opacity"
            onClick={() => setSheetOpen(false)}
            aria-hidden="true"
          />

          {/* Bottom Sheet Card */}
          <div
            className="relative z-10 w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl bg-white border border-[#23096E]/10 shadow-[0_-16px_48px_-12px_rgba(35,9,110,0.3)] p-5 sm:p-6 animate-fade-in"
            style={{
              paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            {/* Mobile grab handle */}
            <div
              className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[#23096E]/15 sm:hidden"
              aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#23096E] to-[#3A1C8F] p-2 shadow-md flex items-center justify-center">
                  <img
                    src="/images/logo-icon.png"
                    alt="Msari"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#23096E]/8 px-2.5 py-0.5 text-[11px] font-bold text-[#3A1C8F]">
                    <Sparkles className="w-3 h-3 text-[#FF3B30]" />
                    {copy.sheetBadge}
                  </span>
                  <h2
                    id="msari-ios-install-sheet-title"
                    className="mt-1 text-base font-extrabold text-[#23096E] leading-snug"
                  >
                    {copy.sheetTitle}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label={copy.closeLabel}
                className="shrink-0 p-1.5 rounded-full text-[#5c4f82] hover:text-[#23096E] hover:bg-[#23096E]/8 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="mt-2.5 text-xs sm:text-sm text-[#423861] leading-relaxed">
              {copy.sheetSubtitle}
            </p>

            {/* 2 Visual Steps */}
            <ol className="mt-4 space-y-3">
              <li className="flex items-center gap-3.5 rounded-2xl bg-[#F4F2F8] border border-[#23096E]/8 p-3.5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#23096E]/12 shadow-xs flex items-center justify-center text-[#007AFF]">
                  <IosShareIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-extrabold text-[#3A1C8F]">
                    {copy.step1Label}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#0A0912] leading-snug mt-0.5">
                    {copy.step1Text}
                  </p>
                </div>
              </li>

              <li className="flex items-center gap-3.5 rounded-2xl bg-[#F4F2F8] border border-[#23096E]/8 p-3.5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-[#23096E]/12 shadow-xs flex items-center justify-center text-[#23096E]">
                  <IosAddToHomeIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-extrabold text-[#3A1C8F]">
                    {copy.step2Label}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#0A0912] leading-snug mt-0.5">
                    {copy.step2Text}
                  </p>
                </div>
              </li>
            </ol>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="w-full rounded-xl bg-gradient-to-r from-[#23096E] to-[#3A1C8F] hover:opacity-95 text-white py-2.5 px-4 text-sm font-extrabold shadow-md transition-all active:scale-[0.99] cursor-pointer"
              >
                {copy.sheetDone}
              </button>

              <p className="text-center text-[11px] font-semibold text-[#5c4f82]">
                {copy.sheetFooterHint} ↓
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default InstallPromptBanner;
