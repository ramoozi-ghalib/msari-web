import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRedirectPage() {
  redirect('https://msariapp-v2.web.app');
}
