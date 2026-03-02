'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import type { ThemeData } from '@/types/theme';

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function NoirHeader({ theme, merchant }: Props) {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href={`/store/${merchant.subdomain}`} className="tracking-[0.3em] text-lg font-light uppercase" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)`, letterSpacing: '0.25em' }}>
          {merchant.storeName || theme.store?.name}
        </Link>
        <nav className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em]" style={{ color: theme.colors.textMuted }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="hover:opacity-100 opacity-50 transition-opacity">Shop</Link>
        </nav>
        <div className="flex items-center gap-5">
          <Link href={`/store/${merchant.subdomain}/cart`} className="relative" style={{ color: theme.colors.text }}>
            <ShoppingBag className="w-[18px] h-[18px]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: theme.colors.primary, color: '#000' }}>
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden" style={{ color: theme.colors.text }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {/* Gold divider */}
      <div className="h-px w-full" style={{ backgroundColor: theme.colors.primary + '60' }} />
      {open && (
        <div className="md:hidden px-6 py-4" style={{ backgroundColor: theme.colors.background }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="block text-xs uppercase tracking-widest py-2 opacity-70" style={{ color: theme.colors.text }} onClick={() => setOpen(false)}>Shop</Link>
        </div>
      )}
    </header>
  );
}
