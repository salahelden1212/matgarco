import { useState, useCallback } from 'react';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export function usePagination(initialPageSize = 20) {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
  });

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination({ page: 1, pageSize, total: 0 });
  }, []);

  const setTotal = useCallback((total: number) => {
    setPagination(prev => ({ ...prev, total }));
  }, []);

  const reset = useCallback(() => {
    setPagination({ page: 1, pageSize: initialPageSize, total: 0 });
  }, [initialPageSize]);

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    pagination,
    setPage,
    setPageSize,
    setTotal,
    reset,
    totalPages,
    offset: (pagination.page - 1) * pagination.pageSize,
  };
}
