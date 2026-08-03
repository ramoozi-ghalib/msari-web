import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-extrabold text-[#0A0912] uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute right-3.5 text-[#423861] pointer-events-none shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'w-full bg-white border text-sm font-semibold text-[#0A0912] rounded-xl transition-all outline-none',
              'px-4 py-3',
              icon && 'pr-11',
              error
                ? 'border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20'
                : 'border-[#23096e]/15 focus:border-[#23096E] focus:ring-2 focus:ring-[#23096E]/15',
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <span className="text-xs font-bold text-[#FF3B30] mt-0.5">{error}</span>
        ) : helperText ? (
          <span className="text-xs text-[#5c4f82] mt-0.5">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
