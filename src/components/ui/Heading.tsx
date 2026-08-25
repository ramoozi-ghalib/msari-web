'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: 'default' | 'brand' | 'accent' | 'on-dark';
  children: React.ReactNode;
}

export function Heading({
  level = 2,
  variant = 'default',
  className,
  children,
  ...props
}: HeadingProps) {
  const Component = `h${level}` as React.ElementType;

  const sizeClasses = {
    1: 'text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.3] tracking-tight',
    2: 'text-xl sm:text-2xl lg:text-3xl font-black leading-snug tracking-tight',
    3: 'text-base sm:text-lg lg:text-xl font-bold leading-snug',
    4: 'text-sm sm:text-base font-bold',
    5: 'text-xs sm:text-sm font-bold',
    6: 'text-[11px] sm:text-xs font-bold',
  }[level];

  const variantClasses = {
    default: 'text-[#0A0912]',
    brand: 'text-[#23096E]',
    accent: 'text-[#FF3B30]',
    'on-dark': '!text-white drop-shadow-sm',
  }[variant];

  return (
    <Component
      className={cn(sizeClasses, variantClasses, className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Heading;
