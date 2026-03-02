'use client';

import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { useCart } from '@/components/CartProvider';
import { useState } from 'react';
import { ShoppingCart, Menu, X, Search, Zap } from 'lucide-react';

interface Props {
  theme: ThemeData;
  merchant: { storeName: string; subdomain: string; logo: string };
}

export default function VoltHeader({ theme, merchant }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header
      className="sticky top-0 z-50"
      style={{ backgroundColor: theme.colors.background, borderBottom: `2px solid ${theme.colors.primary}` }}
    >
      {/* Top stripe */}
      <div className="py-1 px-4 text-center text-xs font-bold" style={{ backgroundColor: theme.colors.primary, color: '#FFFFFF' }}>
        ⚡ مجاني على الطلبات فوق 200 ريال
      </div>

      <div className="flex items-center justify-between max-w-7xl mx-auto px-4 py-4">
        {/* Logo */}
        <Link href={`/store/${merchant.subdomain}`} className="flex items-center gap-2">
          <div className="p-1.5 rounded-md" style={{ backgroundColor: theme.colors.primary }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight uppercase" style={{ color: theme.colors.text }}>
            {merchant.storeName || theme.store?.name || 'VOLT'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[{ label: 'المنتجات', href: `/store/${merchant.subdomain}/products` }].map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-bold uppercase tracking-wider hover:opacity-70 transition-opacity" style={{ color: theme.colors.textMuted }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2 hover:opacity-70" style={{ color: theme.colors.textMuted }}>
            <Search className="w-5 h-5" />
          </button>
          <Link href={`/store/${merchant.subdomain}/cart`} className="relative p-2 hover:opacity-70" style={{ color: theme.colors.text }}>
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center text-white" style={{ backgroundColor: theme.colors.primary }}>
                {totalItems}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2" style={{ color: theme.colors.text }} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4" style={{ backgroundColor: theme.colors.background }}>
          <Link href={`/store/${merchant.subdomain}/products`} className="block py-3 font-bold uppercase text-sm" style={{ color: theme.colors.text }} onClick={() => setMobileOpen(false)}>
            المنتجات
          </Link>
        </div>
      )}
    </header>
  );
}
