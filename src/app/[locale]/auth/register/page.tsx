import { redirect } from 'next/navigation';

export default function OldRegisterPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectParam = searchParams.redirect ? `?redirect=${encodeURIComponent(searchParams.redirect)}` : '';
  redirect(`/register${redirectParam}`);
}
