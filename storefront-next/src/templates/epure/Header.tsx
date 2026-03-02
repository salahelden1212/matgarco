'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import type { ThemeData } from '@/types/theme';

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function EpureHeader({ theme, merchant }: Props) {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ backgroundColor: theme.colors.background + 'F0', borderBottom: `1px solid ${theme.colors.border}` }}>
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href={`/store/${merchant.subdomain}`} className="font-black text-2xl tracking-[0.15em] uppercase" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}>
          {merchant.storeName || theme.store?.name}
        </Link>
        <nav className="hidden md:flex gap-10 text-xs uppercase tracking-widest" style={{ color: theme.colors.textMuted }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="hover:opacity-100 opacity-60 transition-opacity">Collection</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href={`/store/${merchant.subdomain}/cart`} className="relative" style={{ color: theme.colors.text }}>
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white" style={{ backgroundColor: theme.colors.primary }}>
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden" style={{ color: theme.colors.text }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-4" style={{ backgroundColor: theme.colors.background }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="block py-2 text-xs uppercase tracking-widest" style={{ color: theme.colors.text }} onClick={() => setOpen(false)}>Collection</Link>
        </div>
      )}
    </header>
  );
}
