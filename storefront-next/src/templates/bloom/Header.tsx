'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { ShoppingBag, Menu, X, Heart } from 'lucide-react';
import type { ThemeData } from '@/types/theme';

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function BloomHeader({ theme, merchant }: Props) {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: theme.colors.background, borderBottom: `1px solid ${theme.colors.border}` }}>
      {/* Top bar with heart icon */}
      <div className="text-center py-1 text-xs font-medium" style={{ backgroundColor: theme.colors.primary + '20', color: theme.colors.primary }}>
        💖 مرحباً بك في عالم الجمال
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <button className="md:hidden p-1" onClick={() => setOpen(!open)} style={{ color: theme.colors.text }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href={`/store/${merchant.subdomain}`} className="font-black text-xl mx-auto md:mx-0" style={{ color: theme.colors.primary, fontFamily: `var(--font-heading)` }}>
          ✿ {merchant.storeName || theme.store?.name}
        </Link>
        <div className="flex items-center gap-3">
          <Heart className="w-5 h-5 hidden md:block" style={{ color: theme.colors.primary }} />
          <Link href={`/store/${merchant.subdomain}/cart`} className="relative" style={{ color: theme.colors.text }}>
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ backgroundColor: theme.colors.primary }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav className="hidden md:flex justify-center gap-8 py-2 text-sm border-t" style={{ color: theme.colors.text, borderColor: theme.colors.border }}>
        <Link href={`/store/${merchant.subdomain}/products`} className="hover:opacity-70 font-medium">المنتجات</Link>
      </nav>
      {open && (
        <div className="md:hidden px-4 pb-3 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="block py-2 font-medium text-sm" style={{ color: theme.colors.text }} onClick={() => setOpen(false)}>المنتجات</Link>
        </div>
      )}
    </header>
  );
}
