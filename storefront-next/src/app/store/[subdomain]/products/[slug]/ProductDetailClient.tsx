'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { ShoppingCart, Check, Share2, Facebook, Twitter, MessageCircle, Ruler, X, Package, AlertTriangle, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { getImageUrl, getProductImagesArray, optimizeCloudinaryUrl, getPlaceholderImage } from '@/lib/images';
import ReviewSection from '@/components/ReviewSection';
import { ProductCard } from '@/components/theme/ProductCard';

interface Props {
  product: any;
  subdomain: string;
  relatedProducts?: any[];
}

export default function ProductDetailClient({ product, subdomain, relatedProducts = [] }: Props) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Add to recently viewed on mount
  useEffect(() => {
    if (!product) return;
    
    try {
      const stored = localStorage.getItem(`recently_viewed_${subdomain}`);
      let viewedList = stored ? JSON.parse(stored) : [];
      
      // Remove current product if it exists
      viewedList = viewedList.filter((p: any) => p._id !== product._id);
      
      // Add to beginning
      viewedList.unshift({
        _id: product._id,
        name: product.name,
        price: product.price,
        slug: product.slug,
        images: product.images,
        category: product.category,
        comparePrice: product.comparePrice,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock
      });
      
      // Keep only last 4
      if (viewedList.length > 4) viewedList = viewedList.slice(0, 4);
      
      localStorage.setItem(`recently_viewed_${subdomain}`, JSON.stringify(viewedList));
      setRecentlyViewed(viewedList.filter((p: any) => p._id !== product._id)); // show others
    } catch (e) {
      console.error('Could not save recently viewed', e);
    }
  }, [product, subdomain]);

  const images = getProductImagesArray(product);
  const main = images[selectedImage] || getPlaceholderImage();
  const optimizedMain = optimizeCloudinaryUrl(main, { width: 800, height: 800, quality: 90 });
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: main,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm mb-8 text-slate-500 font-medium">
        <Link href={`/store/${subdomain}`} className="hover:text-slate-900 transition-colors">الرئيسية</Link>
        <span className="text-slate-300">/</span>
        <Link href={`/store/${subdomain}/products`} className="hover:text-slate-900 transition-colors">المنتجات</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-900 font-bold">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center">
            {optimizedMain ? (
              <Image 
                src={optimizedMain} 
                alt={product.name} 
                fill 
                className="object-contain p-4" 
                priority 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(product._id);
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <Package className="w-12 h-12 stroke-[1.2]" />
                <span className="text-xs">لا تتوفر صورة للمنتج</span>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex md:grid md:grid-cols-5 gap-2 overflow-x-auto snap-x snap-mandatory md:overflow-visible">
              {images.map((img: string, i: number) => {
                const optimizedThumb = optimizeCloudinaryUrl(img, { width: 150, height: 150, quality: 80 });
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="relative w-16 md:w-auto aspect-square rounded-xl overflow-hidden transition-all bg-slate-50 snap-start flex-shrink-0 md:flex-shrink-0"
                    style={{
                      border: i === selectedImage ? `2px solid #000000` : `1px solid rgba(226, 232, 240, 0.8)`,
                    }}
                  >
                    <Image 
                      src={optimizedThumb} 
                      alt={`${product.name} ${i + 1}`} 
                      fill 
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage();
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.category && (
            <span className="text-xs uppercase tracking-wider text-slate-400 font-extrabold mb-2 block">
              {product.category}
            </span>
          )}
          <h1 className="text-2xl md:text-3.5xl font-black mb-4 text-slate-900 font-heading leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-6">
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current text-slate-200" />
            </div>
            <span className="text-xs font-bold text-slate-500">4.0 (مبني على تقييمات العملاء)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl w-fit">
            <span className="text-3xl font-black text-slate-900">
              {product.price?.toLocaleString('en-US')} ج.م
            </span>
            {hasDiscount && (
              <span className="text-base line-through text-slate-400">
                {product.comparePrice?.toLocaleString('en-US')} ج.م
              </span>
            )}
            {hasDiscount && (
              <span className="px-3 py-1 rounded-full text-xs font-black text-white bg-rose-500 shadow-sm">
                وفر {Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-900 mb-2 text-sm">وصف المنتج:</h3>
              <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line bg-white border border-slate-100 p-4 rounded-2xl">
                {product.description}
              </p>
            </div>
          )}

          {/* Features Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6 border-y border-slate-100 py-5">
            <div className="flex flex-col items-center text-center p-2">
              <Truck className="w-5 h-5 text-slate-600 mb-1.5" />
              <span className="text-[11px] font-extrabold text-slate-800">شحن سريع</span>
              <span className="text-[9px] text-slate-400">لجميع المحافظات</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <ShieldCheck className="w-5 h-5 text-slate-600 mb-1.5" />
              <span className="text-[11px] font-extrabold text-slate-800">أصلي 100%</span>
              <span className="text-[9px] text-slate-400 font-medium">ضمان جودة المنتج</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <RotateCcw className="w-5 h-5 text-slate-600 mb-1.5" />
              <span className="text-[11px] font-extrabold text-slate-800">استرجاع مرن</span>
              <span className="text-[9px] text-slate-400 font-medium">خلال 14 يومًا</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Share2 className="w-3.5 h-3.5" /> مشاركة:
              </span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-500 rounded-full transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 hover:bg-green-50 text-slate-600 hover:text-green-600 rounded-full transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="flex-1" />
            
            <button 
              onClick={() => setShowSizeGuide(true)}
              className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 hover:text-slate-950 transition-colors underline underline-offset-4"
            >
              <Ruler className="w-4 h-4" />
              دليل المقاسات
            </button>
          </div>

          {/* Qty + CTA */}
          {!isOutOfStock ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Qty selector */}
              <div className="flex items-center rounded-xl overflow-hidden bg-slate-50 border border-slate-200 w-fit sm:w-auto">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-lg font-bold hover:bg-slate-100 text-slate-800 transition-colors"
                >
                  −
                </button>
                <span className="px-5 font-bold text-slate-900">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  disabled={qty >= (product.stock || 0)}
                  className="px-4 py-3 text-lg font-bold hover:bg-slate-100 text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-extrabold transition-all hover:-translate-y-0.5 active:scale-98 text-white shadow-md"
                style={{ backgroundColor: added ? '#22C55E' : '#0f172a' }}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> تمت الإضافة للسلة</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> إضافة إلى السلة</>
                )}
              </button>
            </div>
          ) : (
            <div className="py-3 px-6 rounded-xl text-center font-extrabold text-sm bg-slate-50 text-slate-400 border border-slate-200">
              هذا المنتج نفذ من المخزون حالياً
            </div>
          )}

          {/* Stock Notification */}
          {!isOutOfStock && product.stock <= 5 && (
            <p className="text-xs mt-3.5 text-rose-500 font-extrabold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-500" /> متبقي {product.stock} قطع فقط في المخزن!
            </p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 pt-10 border-t border-slate-100">
          <h2 className="text-xl md:text-2xl font-black mb-8 text-slate-900 font-heading">قد يعجبك أيضاً</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.slice(0, 4).map((rp: any) => (
              <ProductCard key={rp._id} product={rp} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-20 pt-10 border-t border-slate-100">
          <h2 className="text-xl md:text-2xl font-black mb-8 text-slate-900 font-heading">شاهدتها مؤخراً</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.map((rp: any) => (
              <ProductCard key={rp._id} product={rp} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <ReviewSection productId={product._id} subdomain={subdomain} />

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-slate-600" />
                دليل المقاسات التقريبي
              </h3>
              <button 
                onClick={() => setShowSizeGuide(false)} 
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="overflow-hidden border border-slate-100 rounded-xl">
                <table className="w-full text-sm text-center border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-extrabold text-slate-700 border-b border-slate-100">
                      <th className="p-3">المقاس</th>
                      <th className="p-3 border-r border-slate-100">الصدر (سم)</th>
                      <th className="p-3 border-r border-slate-100">الخصر (سم)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-650 font-bold">
                    <tr className="border-b border-slate-50"><td className="p-3 font-extrabold text-slate-900">S</td><td className="p-3 border-r border-slate-50">91-96</td><td className="p-3 border-r border-slate-50">71-76</td></tr>
                    <tr className="border-b border-slate-50"><td className="p-3 font-extrabold text-slate-900">M</td><td className="p-3 border-r border-slate-50">96-101</td><td className="p-3 border-r border-slate-50">76-81</td></tr>
                    <tr className="border-b border-slate-50"><td className="p-3 font-extrabold text-slate-900">L</td><td className="p-3 border-r border-slate-50">101-106</td><td className="p-3 border-r border-slate-50">81-86</td></tr>
                    <tr className="border-b border-slate-50"><td className="p-3 font-extrabold text-slate-900">XL</td><td className="p-3 border-r border-slate-50">106-111</td><td className="p-3 border-r border-slate-50">86-91</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-slate-400 text-center font-medium">ملاحظة: المقاسات قد تختلف قليلاً حسب الماركة والقصّة.</p>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowSizeGuide(false)} 
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
