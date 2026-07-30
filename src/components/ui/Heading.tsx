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
    1: 'text-3xl sm:text-5xl lg:text-6xl font-black leading-tight',
    2: 'text-2xl sm:text-4xl lg:text-5xl font-black leading-snug',
    3: 'text-xl sm:text-2xl lg:text-3xl font-extrabold leading-snug',
    4: 'text-lg sm:text-xl font-extrabold',
    5: 'text-base sm:text-lg font-bold',
    6: 'text-sm sm:text-base font-bold',
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
