'use client';

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
}

export function ErrorBoundary({ error, reset, className }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Storefront Error:', error);
  }, [error]);

  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-8 text-center', className)}>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">عذراً، حدث خطأ غير متوقع</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md">
        نأسف لحدوث هذا العطل. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
      </p>
      
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          حاول مرة أخرى
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="rounded-lg bg-white border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          الصفحة الرئيسية
        </button>
      </div>
    </div>
  );
}
