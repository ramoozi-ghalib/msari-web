import { redirect } from 'next/navigation';

export default async function OldRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const redirectParam = redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : '';
  redirect(`/register${redirectParam}`);
}
