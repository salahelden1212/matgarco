import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  label,
  error,
  hint,
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
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-4 py-3 rounded-xl bg-slate-50 border text-sm font-medium outline-none transition-all resize-none',
          'placeholder:text-slate-400',
          'focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20 bg-red-50'
            : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
