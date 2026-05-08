import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  hideClose?: boolean;
  footer?: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  hideClose = false,
  footer,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={cn(
          'bg-white rounded-3xl shadow-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || !hideClose) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              {title && <h2 id="modal-title" className="text-xl font-black text-slate-900">{title}</h2>}
              {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {!hideClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'danger',
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm" hideClose>
      <div className="text-center">
        <div className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4',
          variant === 'danger' ? 'bg-red-100 text-red-600' :
          variant === 'warning' ? 'bg-amber-100 text-amber-600' :
          'bg-indigo-100 text-indigo-600'
        )}>
          {variant === 'danger' ? <X size={24} /> : <X size={24} />}
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{message}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="secondary" fullWidth onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={variant === 'primary' ? 'primary' : 'danger'} fullWidth onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
