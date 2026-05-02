import React from 'react';
import { Skeleton, ProductSkeleton } from '@/components/ui/Skeleton';

export default function StoreLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Skeleton */}
      <section className="relative overflow-hidden bg-[var(--surface)] py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4 md:w-1/2" />
            <Skeleton className="h-6 w-5/6 md:w-2/3" />
            <div className="flex gap-4 pt-4">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-3 w-full max-w-sm">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
