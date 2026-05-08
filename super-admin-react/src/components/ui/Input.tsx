import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-bold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium outline-none transition-all',
            'placeholder:text-slate-400',
            'focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
              : 'border-slate-200',
            leftIcon && 'pr-10',
            rightIcon && 'pl-10',
            props.type === 'password' && 'ltr text-left dir="ltr"',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
