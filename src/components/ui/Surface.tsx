'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'page' | 'card' | 'hero' | 'dark' | 'glass';
  children: React.ReactNode;
}

export function Surface({
  variant = 'page',
  className,
  children,
  ...props
}: SurfaceProps) {
  const variantClasses = {
    page: 'surface-page bg-[#F4F2F8] text-[#0A0912]',
    card: 'surface-card bg-white border border-[#23096E]/10 rounded-3xl shadow-md text-[#0A0912]',
    hero: 'surface-hero bg-gradient-to-br from-[#23096E] via-[#2d1580] to-[#3A1C8F] text-white',
    dark: 'surface-dark bg-[#0A0912] text-white',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
  }[variant];

  return (
    <div className={cn(variantClasses, className)} {...props}>
      {children}
    </div>
  );
}

export default Surface;
