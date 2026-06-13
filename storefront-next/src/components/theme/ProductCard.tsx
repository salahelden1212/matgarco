'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getProductMainImage, optimizeCloudinaryUrl } from '@/lib/images';
import { ShoppingBag, Eye, Star, Check, Heart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

function SmartImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center ${className || ''}`}>
        <ShoppingBag className="w-8 h-8 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

export function ProductCard({ product, priority }: { product: any; priority?: boolean }) {
  const imageUrl = getProductMainImage(product);
  const optimizedUrl = optimizeCloudinaryUrl(imageUrl, { width: 500, height: 600, quality: 85 });
  const comparePrice = product.comparePrice || product.compareAtPrice || 0;
  const hasDiscount = comparePrice > product.price;
  const isOutOfStock = product.stock === 0;

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    try {
      const subdomain = window.location.pathname.split('/store/')[1]?.split('/')[0] || 'default';
      const key = `wishlist_${subdomain}`;
      const stored = localStorage.getItem(key);
      const list = stored ? JSON.parse(stored) : [];
      setInWishlist(list.some((p: any) => p._id === product._id));
    } catch (e) {}
  }, [product._id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const subdomain = window.location.pathname.split('/store/')[1]?.split('/')[0] || 'default';
      const key = `wishlist_${subdomain}`;
      const stored = localStorage.getItem(key);
      let list = stored ? JSON.parse(stored) : [];
      
      if (inWishlist) {
        list = list.filter((p: any) => p._id !== product._id);
        setInWishlist(false);
      } else {
        list.push(product);
        setInWishlist(true);
      }
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  };

  let cart: any = null;
  try {
    cart = useCart();
  } catch (e) {
    // Fallback
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cart || isOutOfStock || adding) return;

    setAdding(true);
    try {
      await cart.addItem({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: imageUrl,
        quantity: 1,
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add item', err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Image Area */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-slate-50 block">
        <SmartImage
          src={optimizedUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-500 ease-out"
          {...(priority ? { fetchpriority: 'high', loading: 'eager' } : { loading: 'lazy' })}
        />
        
        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-rose-600 flex items-center justify-center transition-all shadow-sm z-20"
        >
          <Heart className={`w-4 h-4 transition-transform duration-300 active:scale-120 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] md:text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
            خصم {Math.round((1 - product.price / comparePrice) * 100)}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
              نفذت الكمية
            </span>
          </div>
        )}

        {/* Hover Actions Menu */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex gap-2">
            <button
              onClick={handleQuickAdd}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white text-slate-900 hover:bg-slate-900 hover:text-white py-2 rounded-xl text-xs font-extrabold shadow-lg transition-colors duration-200"
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" /> تم الإضافة
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> أضف للسلة
                </>
              )}
            </button>
            <Link
              href={`/products/${product.slug}`}
              className="w-9 h-9 flex items-center justify-center bg-white/95 text-slate-700 hover:bg-slate-900 hover:text-white rounded-xl shadow-lg transition-colors duration-200"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        )}
      </Link>

      {/* Info Area */}
      <div className="p-4 flex flex-col flex-grow">
        {product.category && (
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
            {product.category}
          </span>
        )}
        
        <Link href={`/products/${product.slug}`} className="block mb-2">
          <h3 className="font-extrabold text-sm md:text-base text-slate-800 line-clamp-2 hover:text-slate-950 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating Stars fallback */}
        <div className="flex items-center gap-0.5 text-amber-400 mb-3 mt-auto">
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current" />
          <Star className="w-3.5 h-3.5 fill-current text-slate-200" />
          <span className="text-slate-400 text-[10px] font-bold mr-1.5">4.0</span>
        </div>

        <div className="flex items-baseline justify-between gap-2 border-t border-slate-50 pt-3 mt-1">
          <div className="flex items-baseline gap-2">
            <span className="font-black text-slate-900 text-base md:text-lg">
              {product.price.toLocaleString('en-US')} ج.م
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {comparePrice.toLocaleString('en-US')}
              </span>
            )}
          </div>
          
          {/* Mobile Quick Add Button */}
          {!isOutOfStock && (
            <button
              onClick={handleQuickAdd}
              disabled={adding}
              className="md:hidden w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-colors shadow-md"
            >
              {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
