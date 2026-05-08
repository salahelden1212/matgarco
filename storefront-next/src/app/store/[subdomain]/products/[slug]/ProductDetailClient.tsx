'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { ShoppingCart, Check, Share2, Facebook, Twitter, MessageCircle, Ruler } from 'lucide-react';
import { getImageUrl, getProductImagesArray, optimizeCloudinaryUrl, getPlaceholderImage } from '@/lib/images';

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
        images: product.images
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
      <nav className="text-sm mb-8 text-[var(--text-muted)]">
        <Link href={`/store/${subdomain}`} className="hover:underline">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/store/${subdomain}/products`} className="hover:underline">المنتجات</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--text)]">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 bg-[var(--surface)]">
            {optimizedMain ? (
              <Image 
                src={optimizedMain} 
                alt={product.name} 
                fill 
                className="object-contain" 
                priority 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getPlaceholderImage(product._id);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img: string, i: number) => {
                const optimizedThumb = optimizeCloudinaryUrl(img, { width: 150, height: 150, quality: 80 });
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="relative aspect-square rounded-lg overflow-hidden transition-all bg-[var(--surface)]"
                    style={{
                      border: i === selectedImage ? `2px solid var(--primary)` : `1px solid var(--border)`,
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
        <div>
          {product.category && (
            <p className="text-sm mb-2 text-[var(--text-muted)]">{product.category}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-black mb-4 text-[var(--text)] font-heading">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black text-[var(--primary)]">
              {product.price?.toLocaleString()} ج.م
            </span>
            {hasDiscount && (
              <span className="text-lg line-through text-[var(--text-muted)]">
                {product.comparePrice?.toLocaleString()}
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-sm font-bold text-white bg-red-500">
                خصم {Math.round((1 - product.price / product.comparePrice) * 100)}%
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed mb-6 text-[var(--text-muted)] whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Social Sharing & Size Guide Actions */}
          <div className="flex flex-wrap items-center gap-4 mb-6 pt-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1">
                <Share2 className="w-4 h-4" /> شارك:
              </span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(product.name)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(product.name + ' - ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="flex-1" />
            
            <button 
              onClick={() => setShowSizeGuide(true)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--text)] hover:text-[var(--primary)] transition-colors underline underline-offset-4"
            >
              <Ruler className="w-4 h-4" />
              دليل المقاسات
            </button>
          </div>

          {/* Qty + CTA */}
          {!isOutOfStock ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Qty selector */}
              <div className="flex items-center rounded-[var(--radius)] overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-lg font-bold hover:opacity-70 text-[var(--text)]"
                >
                  −
                </button>
                <span className="px-4 font-semibold text-[var(--text)]">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  disabled={qty >= (product.stock || 0)}
                  className="px-4 py-3 text-lg font-bold hover:opacity-70 text-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-[var(--radius)] font-bold transition-all hover:opacity-90 active:scale-95 text-white"
                style={{ backgroundColor: added ? '#22C55E' : 'var(--primary)' }}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> تمت الإضافة!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> أضف للسلة</>
                )}
              </button>
            </div>
          ) : (
            <div className="py-3 px-6 rounded-[var(--radius)] text-center font-bold text-sm bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]">
              هذا المنتج نفذ من المخزون
            </div>
          )}

          {/* Stock */}
          {!isOutOfStock && product.stock <= 5 && (
            <p className="text-xs mt-3 text-orange-500 font-medium">⚠️ باقي {product.stock} قطع فقط!</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-black mb-6 text-[var(--text)]">منتجات قد تعجبك</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((rp: any) => {
              const img = getImageUrl(rp.images?.[0]);
              const optimizedImg = optimizeCloudinaryUrl(img, { width: 400, height: 400, quality: 80 });
              return (
                <Link
                  key={rp._id}
                  href={`/store/${subdomain}/products/${rp.slug || rp._id}`}
                  className="group block rounded-[var(--radius)] overflow-hidden hover:shadow-md transition-shadow bg-[var(--surface)] border border-[var(--border)]"
                >
                  <div className="relative aspect-square bg-[var(--background)]">
                    {optimizedImg ? (
                      <Image 
                        src={optimizedImg} 
                        alt={rp.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(rp._id);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-1 text-[var(--text)]">{rp.name}</p>
                    <p className="text-sm font-bold mt-1 text-[var(--primary)]">{rp.price?.toLocaleString()} ج.م</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[var(--border)]">
          <h2 className="text-xl font-black mb-6 text-[var(--text)] text-center">شاهدت مؤخراً</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((rp: any) => {
              const img = getImageUrl(rp.images?.[0]);
              const optimizedImg = optimizeCloudinaryUrl(img, { width: 400, height: 400, quality: 80 });
              return (
                <Link
                  key={rp._id}
                  href={`/store/${subdomain}/products/${rp.slug || rp._id}`}
                  className="group block rounded-[var(--radius)] overflow-hidden hover:shadow-md transition-shadow bg-[var(--surface)] border border-[var(--border)]"
                >
                  <div className="relative aspect-square bg-[var(--background)]">
                    {optimizedImg ? (
                      <Image 
                        src={optimizedImg} 
                        alt={rp.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage(rp._id);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold line-clamp-1 text-[var(--text)]">{rp.name}</p>
                    <p className="text-sm font-bold mt-1 text-[var(--text-muted)]">{rp.price?.toLocaleString()} ج.م</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowSizeGuide(false)}>
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-bold text-lg text-[var(--text)] flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[var(--primary)]" />
                دليل المقاسات التقريبي
              </h3>
              <button onClick={() => setShowSizeGuide(false)} className="text-[var(--text-muted)] hover:text-[var(--text)]">✕</button>
            </div>
            <div className="p-6">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-[var(--background)]">
                    <th className="border border-[var(--border)] p-2">المقاس</th>
                    <th className="border border-[var(--border)] p-2">الصدر (سم)</th>
                    <th className="border border-[var(--border)] p-2">الخصر (سم)</th>
                  </tr>
                </thead>
                <tbody className="text-[var(--text)]">
                  <tr><td className="border border-[var(--border)] p-2 font-bold">S</td><td className="border border-[var(--border)] p-2">91-96</td><td className="border border-[var(--border)] p-2">71-76</td></tr>
                  <tr><td className="border border-[var(--border)] p-2 font-bold">M</td><td className="border border-[var(--border)] p-2">96-101</td><td className="border border-[var(--border)] p-2">76-81</td></tr>
                  <tr><td className="border border-[var(--border)] p-2 font-bold">L</td><td className="border border-[var(--border)] p-2">101-106</td><td className="border border-[var(--border)] p-2">81-86</td></tr>
                  <tr><td className="border border-[var(--border)] p-2 font-bold">XL</td><td className="border border-[var(--border)] p-2">106-111</td><td className="border border-[var(--border)] p-2">86-91</td></tr>
                </tbody>
              </table>
              <p className="mt-4 text-xs text-[var(--text-muted)] text-center">ملاحظة: المقاسات قد تختلف قليلاً حسب الماركة والقصّة.</p>
            </div>
            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]">
              <button onClick={() => setShowSizeGuide(false)} className="w-full py-2.5 bg-[var(--primary)] text-white font-medium rounded-lg">حسناً، فهمت</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
