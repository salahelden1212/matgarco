'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { ProductCard } from '@/components/theme/ProductCard';

interface Props {
  subdomain: string;
}

export default function WishlistPageClient({ subdomain }: Props) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`wishlist_${subdomain}`);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  const clearWishlist = () => {
    try {
      localStorage.setItem(`wishlist_${subdomain}`, JSON.stringify([]));
      setWishlist([]);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <span className="inline-block w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm mb-6 text-slate-500 font-medium">
        <Link href={`/store/${subdomain}`} className="hover:text-slate-900 transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">المفضلة</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-heading tracking-tight flex items-center gap-2">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            المنتجات المفضلة
          </h1>
          <p className="text-xs md:text-sm mt-1.5 text-slate-500 font-semibold">
            {wishlist.length} منتج محفوظ
          </p>
        </div>

        {wishlist.length > 0 && (
          <button 
            onClick={clearWishlist}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all border border-rose-150 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            مسح القائمة بالكامل
          </button>
        )}
      </div>

      {/* Grid or Empty state */}
      {wishlist.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-slate-50 border border-slate-100 rounded-3xl p-8 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100/50">
            <Heart className="w-7 h-7" />
          </div>
          <p className="text-xl font-black text-slate-850 mb-2">قائمة أمنياتك فارغة</p>
          <p className="text-sm text-slate-400 mb-6 font-medium">احفظ منتجاتك المفضلة هنا لتصل إليها وتشتريها بسهولة لاحقاً.</p>
          <Link
            href={`/store/${subdomain}/products`}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-slate-800 transition-all duration-200"
          >
            تصفح المنتجات الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
