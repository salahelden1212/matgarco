import { cn } from '../../lib/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-slate-300 select-none">/</span>
          )}
          {item.path && index < items.length - 1 ? (
            <a
              href={item.path}
              className="text-slate-500 hover:text-slate-700 transition-colors font-medium"
            >
              {item.label}
            </a>
          ) : (
            <span className={cn(
              'font-bold',
              index === items.length - 1 ? 'text-slate-700' : 'text-slate-500'
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
