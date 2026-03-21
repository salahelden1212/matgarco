'use client';

import { useCart } from '@/components/CartProvider';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

interface Props {
  subdomain: string;
  theme: { colors: Record<string, string>; store?: { currency?: string; name?: string } };
}

export default function CartPageClient({ subdomain, theme }: Props) {
  const { items, totalItems, totalPrice, removeItem, updateQty, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="p-6 rounded-full" style={{ backgroundColor: theme.colors.primary + '15' }}>
          <ShoppingBag className="w-12 h-12" style={{ color: theme.colors.primary }} />
        </div>
        <h2 className="text-2xl font-black" style={{ color: theme.colors.text }}>سلتك فارغة</h2>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>لم تضف أي منتجات بعد</p>
        <Link
          href={`/store/${subdomain}/products`}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: theme.colors.primary }}
        >
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black" style={{ color: theme.colors.text }}>
          سلة التسوق ({totalItems})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: theme.colors.textMuted }}
        >
          <Trash2 className="w-3 h-3" /> إفراغ السلة
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 p-4 rounded-2xl"
              style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
            >
              {/* Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between">
                  <p className="font-semibold text-sm" style={{ color: theme.colors.text }}>{item.name}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="hover:opacity-60 transition-opacity"
                    style={{ color: theme.colors.textMuted }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  {/* Qty */}
                  <div
                    className="flex items-center rounded-lg overflow-hidden"
                    style={{ border: `1px solid ${theme.colors.border}` }}
                  >
                    <button
                      onClick={() => updateQty(item.productId, Math.max(1, item.quantity - 1))}
                      className="px-3 py-1 text-sm hover:opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm font-semibold" style={{ color: theme.colors.text }}>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      className="px-3 py-1 text-sm hover:opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Price */}
                  <span className="font-bold text-sm" style={{ color: theme.colors.primary }}>
                    {(item.price * item.quantity).toLocaleString()} {theme.store?.currency || 'ج'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div
          className="p-6 rounded-2xl h-fit sticky top-6"
          style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
        >
          <h3 className="font-black text-base mb-4" style={{ color: theme.colors.text }}>ملخص الطلب</h3>
          <div className="space-y-3 text-sm mb-4" style={{ color: theme.colors.textMuted }}>
            <div className="flex justify-between">
              <span>المنتجات ({totalItems})</span>
              <span>{totalPrice.toLocaleString()} {theme.store?.currency || 'ج'}</span>
            </div>
            <div className="flex justify-between">
              <span>الشحن</span>
              <span className="text-green-500 font-medium">مجانا</span>
            </div>
          </div>
          <div
            className="flex justify-between font-black text-base py-3 border-t"
            style={{ borderColor: theme.colors.border, color: theme.colors.text }}
          >
            <span>الإجمالي</span>
            <span style={{ color: theme.colors.primary }}>{totalPrice.toLocaleString()} {theme.store?.currency || 'ج'}</span>
          </div>

          <Link
            href={`/store/${subdomain}/checkout`}
            className="block w-full mt-4 py-3 rounded-xl font-bold text-white text-sm text-center transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            إتمام الشراء →
          </Link>

          <Link
            href={`/store/${subdomain}/products`}
            className="block text-center mt-3 text-xs hover:underline"
            style={{ color: theme.colors.textMuted }}
          >
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}
