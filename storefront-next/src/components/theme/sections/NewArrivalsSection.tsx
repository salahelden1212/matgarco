import React from 'react';
import Link from 'next/link';
import { ProductCard } from '../ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function NewArrivalsSection({ settings, storeData }: { settings: Record<string, any>; storeData?: any }) {
  const {
    title = 'وصل حديثاً',
    limit = 8,
  } = settings;

  const products: any[] = storeData?.products ?? [];
  // Show the last `limit` products as "new arrivals"
  const newProducts = [...products].reverse().slice(0, limit);

  const subdomain = storeData?.merchant?.subdomain;
  const base = subdomain ? `/store/${subdomain}` : '';

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10 pb-4 border-b border-slate-100">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{title}</h2>
          <Link
            href={`${base}/products?sort=newest`}
            className="text-slate-900 font-extrabold hover:text-slate-750 flex items-center gap-1.5 transition-colors text-sm"
          >
            <span>عرض الكل</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {newProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white border border-slate-100 rounded-2xl font-bold">
            لا توجد منتجات جديدة لعرضها حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
