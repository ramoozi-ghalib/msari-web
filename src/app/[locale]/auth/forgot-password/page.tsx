import { redirect } from 'next/navigation';

export default async function OldForgotPasswordPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const resolvedParams = await searchParams;
  const redirectParam = resolvedParams?.redirect ? `?redirect=${encodeURIComponent(resolvedParams.redirect)}` : '';
  redirect(`/forgot-password${redirectParam}`);
}
