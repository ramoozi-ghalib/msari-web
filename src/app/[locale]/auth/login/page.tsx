import { redirect } from 'next/navigation';

export default async function OldLoginPage({ searchParams }: { searchParams: Promise<{ redirect?: string }> }) {
  const resolvedParams = await searchParams;
  const redirectParam = resolvedParams?.redirect ? `?redirect=${encodeURIComponent(resolvedParams.redirect)}` : '';
  redirect(`/login${redirectParam}`);
}
