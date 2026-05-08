import { cn } from '../../lib/utils';

export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';
  size?: 'xs' | 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
};

const sizeStyles = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
  className,
  dot,
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold border rounded-full',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant']; icon: React.ReactNode }> = {
    active: {
      label: 'نشط',
      variant: 'success',
      icon: null,
    },
    suspended: {
      label: 'موقوف',
      variant: 'danger',
      icon: null,
    },
    cancelled: {
      label: 'ملغى',
      variant: 'default',
      icon: null,
    },
    paid: {
      label: 'مدفوعة',
      variant: 'success',
      icon: null,
    },
    failed: {
      label: 'فشل',
      variant: 'danger',
      icon: null,
    },
    pending: {
      label: 'معلق',
      variant: 'warning',
      icon: null,
    },
    open: {
      label: 'مفتوحة',
      variant: 'info',
      icon: null,
    },
    in_progress: {
      label: 'قيد المعالجة',
      variant: 'warning',
      icon: null,
    },
    resolved: {
      label: 'تم الحل',
      variant: 'success',
      icon: null,
    },
    closed: {
      label: 'مغلقة',
      variant: 'default',
      icon: null,
    },
  };

  const c = config[status] || { label: status, variant: 'default' as const, icon: null };
  return <Badge variant={c.variant} dot>{c.label}</Badge>;
}

export function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    free_trial: { label: 'تجربة مجانية', variant: 'default' },
    starter: { label: 'Starter', variant: 'info' },
    professional: { label: 'Professional', variant: 'purple' },
    business: { label: 'Business', variant: 'amber' },
  };
  const c = config[plan] || { label: plan, variant: 'default' as const };
  return <Badge variant={c.variant} size="sm">{c.label}</Badge>;
}
