'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { useCart } from '@/components/CartProvider';
import { ShoppingCart, Check } from 'lucide-react';

interface Props {
  product: any;
  theme: ThemeData;
  subdomain: string;
  relatedProducts?: any[];
}

function getImageUrl(img: any): string {
  if (!img) return '';
  return typeof img === 'string' ? img : img.url || '';
}

export default function ProductDetailClient({ product, theme, subdomain, relatedProducts = [] }: Props) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const images   = product.images || [];
  const main     = getImageUrl(images[selectedImage]) || '';
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
      <nav className="text-sm mb-8" style={{ color: theme.colors.textMuted }}>
        <Link href={`/store/${subdomain}`} className="hover:underline">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/store/${subdomain}/products`} className="hover:underline">المنتجات</Link>
        <span className="mx-2">/</span>
        <span style={{ color: theme.colors.text }}>{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3" style={{ backgroundColor: theme.colors.surface }}>
            {main ? (
              <Image src={main} alt={product.name} fill className="object-contain" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">📦</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((img: any, i: number) => {
                const url = getImageUrl(img);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className="relative aspect-square rounded-lg overflow-hidden transition-all"
                    style={{
                      border: i === selectedImage ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    {url && <Image src={url} alt={`${product.name} ${i + 1}`} fill className="object-cover" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <p className="text-sm mb-2" style={{ color: theme.colors.textMuted }}>{product.category}</p>
          )}
          <h1 className="text-2xl md:text-3xl font-black mb-4" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}>
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black" style={{ color: theme.colors.primary }}>
              {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
            </span>
            {hasDiscount && (
              <span className="text-lg line-through" style={{ color: theme.colors.textMuted }}>
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
            <p className="text-sm leading-relaxed mb-6" style={{ color: theme.colors.textMuted }}>
              {product.description}
            </p>
          )}

          {/* Qty + CTA */}
          {!isOutOfStock ? (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Qty selector */}
              <div
                className="flex items-center rounded-xl overflow-hidden"
                style={{ border: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.surface }}
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-lg font-bold hover:opacity-70"
                  style={{ color: theme.colors.text }}
                >
                  −
                </button>
                <span className="px-4 font-semibold" style={{ color: theme.colors.text }}>{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-4 py-3 text-lg font-bold hover:opacity-70"
                  style={{ color: theme.colors.text }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: added ? '#22C55E' : theme.colors.primary, color: '#FFFFFF' }}
              >
                {added ? (
                  <><Check className="w-5 h-5" /> تمت الإضافة!</>
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> أضف للسلة</>
                )}
              </button>
            </div>
          ) : (
            <div
              className="py-3 px-6 rounded-xl text-center font-bold text-sm"
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.textMuted, border: `1px solid ${theme.colors.border}` }}
            >
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
          <h2 className="text-xl font-black mb-6" style={{ color: theme.colors.text }}>منتجات قد تعجبك</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((rp: any) => {
              const img = getImageUrl(rp.images?.[0]);
              return (
                <Link
                  key={rp._id}
                  href={`/store/${subdomain}/products/${rp.slug || rp._id}`}
                  className="group block rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="relative aspect-square" style={{ backgroundColor: theme.colors.background }}>
                    {img ? <Image src={img} alt={rp.name} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold line-clamp-1" style={{ color: theme.colors.text }}>{rp.name}</p>
                    <p className="text-xs font-bold mt-1" style={{ color: theme.colors.primary }}>{rp.price?.toLocaleString()} {theme.store?.currency || 'ج'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
