import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { checkAccountVerificationStatus } from '@/actions/auth';
import { getSafeRedirect } from '@/lib/safeRedirect';

export const dynamic = 'force-dynamic';

export default async function PostOAuthPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [{ locale }, params] = await Promise.all([props.params, props.searchParams]);
  const safeLocale = locale === 'en' ? 'en' : 'ar';

  const rawRedirect = typeof params.redirect === 'string' ? params.redirect : `/${safeLocale}`;
  let safeRedirect = getSafeRedirect(rawRedirect);
  if (safeRedirect.includes('/auth/post-oauth') || safeRedirect.includes('/verify-account')) {
    safeRedirect = `/${safeLocale}`;
  }

  const session = await auth();
  if (!session?.user) {
    redirect(
      `/${safeLocale}/login?error=OAuthSignin&redirect=${encodeURIComponent(safeRedirect)}`
    );
  }

  const liveStatus = await checkAccountVerificationStatus();
  const hasVerifiedPhone = Boolean(
    (liveStatus.authenticated && liveStatus.phone) || session.user.phone
  );
  const isVerified = liveStatus.authenticated
    ? liveStatus.isVerified && hasVerifiedPhone
    : Boolean(session.user.isVerified && hasVerifiedPhone);

  if (isVerified) {
    redirect(safeRedirect);
  }

  redirect(
    `/${safeLocale}/verify-account?redirect=${encodeURIComponent(safeRedirect)}`
  );
}
