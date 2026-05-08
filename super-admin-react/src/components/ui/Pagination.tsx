import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  showPageSize?: boolean;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
  showPageSize = false,
}: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/50', className)}>
      <div className="flex items-center gap-4">
        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">عدد العناصر:</span>
            <select
              value={pageSize}
              onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              className="px-2 py-1 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
        <span className="text-sm text-slate-500">
          عرض {start}–{end} من {total}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          icon={<ChevronRight size={16} />}
          iconPosition="right"
          className="w-8 h-8 p-0 justify-center"
          aria-label="الصفحة السابقة"
        />

        {visiblePages[0] > 1 && (
          <>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} className="w-8 h-8 p-0">1</Button>
            {visiblePages[0] > 2 && <span className="px-1 text-slate-400">...</span>}
          </>
        )}

        {visiblePages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => onPageChange(p)}
            className={cn('w-8 h-8 p-0 justify-center', p === page && 'pointer-events-none')}
          >
            {p}
          </Button>
        ))}

        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
            <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} className="w-8 h-8 p-0">
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          icon={<ChevronLeft size={16} />}
          iconPosition="left"
          className="w-8 h-8 p-0 justify-center"
          aria-label="الصفحة التالية"
        />
      </div>
    </div>
  );
}

function getVisiblePages(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 4) return [1, 2, 3, 4, 5, 6];
  if (current >= total - 3) return [total - 5, total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}
