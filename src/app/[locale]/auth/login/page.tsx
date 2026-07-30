import { redirect } from 'next/navigation';

export default function OldLoginPage({ searchParams }: { searchParams: { redirect?: string } }) {
  const redirectParam = searchParams.redirect ? `?redirect=${encodeURIComponent(searchParams.redirect)}` : '';
  redirect(`/login${redirectParam}`);
}
