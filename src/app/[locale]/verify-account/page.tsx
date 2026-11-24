import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { checkAccountVerificationStatus } from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';
import VerifyAccountClient from '@/components/auth/VerifyAccountClient';

export const metadata: Metadata = {
  title: 'تفعيل الحساب — مساري',
  robots: { index: false, follow: false },
};

export default async function VerifyAccountPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ locale }, params] = await Promise.all([props.params, props.searchParams]);

  const rawRedirect = typeof params.redirect === 'string' ? params.redirect : '/';
  let safeRedirect = getSafeRedirect(rawRedirect);
  if (safeRedirect.includes('/verify-account')) {
    safeRedirect = `/${locale}`;
  }

  const autoSend = params.autoSend === '1' || params.autoSend === 'true';

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login?redirect=${encodeURIComponent(safeRedirect)}`);
  }

  const liveStatus = await checkAccountVerificationStatus();
  const isVerifiedOnServer = liveStatus.authenticated && liveStatus.isVerified;

  if (isVerifiedOnServer && session.user.isVerified) {
    redirect(safeRedirect);
  }

  const alreadyVerifiedOnServer = isVerifiedOnServer && !session.user.isVerified;
  const email = (liveStatus.authenticated && liveStatus.email) || session.user.email || '';
  const pendingPhone =
    (liveStatus.authenticated && liveStatus.pendingPhone) ||
    session.user.pendingPhone ||
    undefined;

  return (
    <VerifyAccountClient
      email={email}
      pendingPhone={pendingPhone}
      redirectTo={safeRedirect}
      autoSend={autoSend}
      locale={locale}
      alreadyVerifiedOnServer={alreadyVerifiedOnServer}
    />
  );
}
