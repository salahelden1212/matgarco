import React from 'react';
import Link from 'next/link';
import { ProductCard } from '../ProductCard';
import { ArrowLeft } from 'lucide-react';

export default function FeaturedProductsSection({ settings, storeData }: { settings: Record<string, any>, storeData?: any }) {
  const {
    title = 'منتجات مميزة',
    subtitle = 'اكتشف أحدث المنتجات المضافة لمتجرنا',
    viewAllText = 'عرض الكل',
    viewAllLink = '/products',
    limit = 8,
  } = settings;

  const products = storeData?.products || [];
  const displayProducts = products.slice(0, limit);
  
  const subdomain = storeData?.merchant?.subdomain;
  const base = subdomain ? `/store/${subdomain}` : '';
  const finalLink = viewAllLink.startsWith('/') ? `${base}${viewAllLink}` : `${base}/${viewAllLink}`;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 pb-4 border-b border-slate-50">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{title}</h2>
            {subtitle && <p className="text-slate-500 text-sm md:text-base font-medium">{subtitle}</p>}
          </div>
          {viewAllText && (
            <Link 
              href={finalLink}
              className="mt-4 sm:mt-0 text-slate-900 font-extrabold hover:text-slate-750 flex items-center gap-1.5 transition-colors text-sm"
            >
              <span>{viewAllText}</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
        </div>

        {displayProducts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl font-bold">
            لا توجد منتجات مميزة لعرضها حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayProducts.map((product: any, i: number) => (
              <ProductCard key={product._id} product={product} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
