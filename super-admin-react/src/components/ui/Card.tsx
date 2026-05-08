import { cn } from '../../lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, padding = 'md', hover = false, header, footer }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden',
        hover && 'hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {header && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          {header}
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
          {footer}
        </div>
      )}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  iconColor = 'indigo',
  trend,
  trendLabel,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  iconColor?: 'indigo' | 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'teal' | 'orange';
  trend?: 'up' | 'down' | number;
  trendLabel?: string;
  className?: string;
}) {
  const iconBg: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-100 text-teal-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  const trendColor = trend === 'up' || (typeof trend === 'number' && trend > 0)
    ? 'text-emerald-600'
    : trend === 'down' || (typeof trend === 'number' && trend < 0)
    ? 'text-red-600'
    : 'text-slate-500';

  return (
    <Card className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 truncate">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          {(trend || trendLabel) && (
            <p className={cn('text-xs font-bold mt-1', trendColor)}>
              {typeof trend === 'number' && (
                <span>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              )}
              {trendLabel && <span className="mr-1">{trendLabel}</span>}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg[iconColor])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
