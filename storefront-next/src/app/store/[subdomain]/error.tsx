'use client';

import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  );
}
