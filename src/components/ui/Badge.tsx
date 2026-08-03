import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'primary' | 'secondary' | 'success' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'accent',
  size = 'md',
  icon,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 font-bold rounded-full transition-colors shrink-0';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-xs',
  }[size];

  const variantClasses = {
    accent: 'bg-[#FF3B30] text-white shadow-sm',
    primary: 'bg-[#23096E] text-white',
    secondary: 'bg-[#23096E]/10 text-[#23096E] border border-[#23096E]/20',
    success: 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20',
    outline: 'bg-white/80 backdrop-blur-md text-[#23096E] border border-[#23096E]/20',
  }[variant];

  return (
    <span
      className={clsx(
        baseClasses,
        sizeClasses,
        variantClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
