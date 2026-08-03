import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'bordered' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  radius = 'lg', // Default 16px (radius-lg) as requested
  children,
  className,
  ...props
}) => {
  const baseClasses = 'bg-white transition-all duration-300';
  
  const radiusClasses = {
    md: 'rounded-xl',    // 12px
    lg: 'rounded-2xl',   // 16px (Default for items/cards)
    xl: 'rounded-3xl',   // 24px (For Hero/Section Containers)
  }[radius];

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }[padding];

  const variantClasses = {
    default: 'border border-[#23096e]/10 shadow-sm',
    elevated: 'border border-[#23096e]/10 shadow-md hover:shadow-xl',
    bordered: 'border-2 border-[#23096e]/15',
    interactive: 'border border-[#23096e]/10 shadow-sm hover:shadow-xl hover:-translate-y-1 cursor-pointer',
  }[variant];

  return (
    <div
      className={clsx(
        baseClasses,
        radiusClasses,
        paddingClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
