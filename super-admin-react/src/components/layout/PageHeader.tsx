import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; path?: string }>;
  className?: string;
  iconBg?: string;
  iconColor?: string;
}

export function PageHeader({
  icon,
  title,
  description,
  actions,
  breadcrumbs,
  className,
  iconBg = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
}: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              {crumb.path && i < breadcrumbs.length - 1 ? (
                <a href={crumb.path} className="hover:text-slate-600">{crumb.label}</a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner', iconBg, iconColor)}>
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{title}</h1>
            {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
