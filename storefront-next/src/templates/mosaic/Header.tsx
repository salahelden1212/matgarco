'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { ShoppingCart, Search, Menu, X, LayoutGrid } from 'lucide-react';
import type { ThemeData } from '@/types/theme';

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function MosaicHeader({ theme, merchant }: Props) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-50 shadow-sm" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: theme.colors.text }}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href={`/store/${merchant.subdomain}`} className="flex items-center gap-2 font-black text-lg" style={{ color: theme.colors.primary }}>
          <LayoutGrid className="w-6 h-6" />
          {merchant.storeName || theme.store?.name}
        </Link>

        {/* Search bar (desktop) */}
        <div className="flex-1 hidden md:block max-w-lg mx-4">
          <div className="flex items-center rounded-full px-4 py-2 text-sm gap-2" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
            <Search className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
            <input placeholder="ابحث عن منتج..." className="flex-1 outline-none bg-transparent text-sm" style={{ color: theme.colors.text }} />
          </div>
        </div>

        <div className="flex items-center gap-2 mr-auto">
          <button className="md:hidden p-2" style={{ color: theme.colors.text }} onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="w-5 h-5" />
          </button>
          <Link href={`/store/${merchant.subdomain}/cart`} className="relative flex items-center gap-1 px-3 py-2 rounded-full text-sm font-bold text-white" style={{ backgroundColor: theme.colors.primary }}>
            <ShoppingCart className="w-4 h-4" />
            {totalItems > 0 && <span>{totalItems}</span>}
          </Link>
        </div>
      </div>
      {searchOpen && (
        <div className="md:hidden px-4 pb-3" style={{ backgroundColor: theme.colors.background }}>
          <div className="flex items-center rounded-full px-4 py-2 gap-2" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}>
            <Search className="w-4 h-4" style={{ color: theme.colors.textMuted }} />
            <input placeholder="ابحث..." className="flex-1 outline-none bg-transparent text-sm" style={{ color: theme.colors.text }} />
          </div>
        </div>
      )}
      {open && (
        <div className="md:hidden px-4 pb-3 border-t" style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="block py-2 font-medium text-sm" style={{ color: theme.colors.text }} onClick={() => setOpen(false)}>جميع المنتجات</Link>
        </div>
      )}
    </header>
  );
}
