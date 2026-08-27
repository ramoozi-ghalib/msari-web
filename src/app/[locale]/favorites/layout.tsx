import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المفضلة — مساري',
  robots: { index: false, follow: false },
};

export default function FavoritesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
