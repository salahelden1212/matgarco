'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Search, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/components/CartProvider';
import type { ThemeData } from '@/types/theme';

interface Props {
  theme: ThemeData;
  merchant: { storeName: string; subdomain: string; logo: string };
}

export default function SparkHeader({ theme, merchant }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems } = useCart();

  const base = `/store/${merchant.subdomain}`;
  const headerStyle = theme.header?.style || 'split';
  const isDark = false; // Spark is always light

  const navLinks = [
    { label: 'الرئيسية', href: base },
    { label: 'المنتجات', href: `${base}/products` },
  ];

  return (
    <header
      className="sticky top-0 z-50 shadow-sm"
      style={{ backgroundColor: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className={`flex items-center h-16 ${headerStyle === 'centered' ? 'justify-between' : 'justify-between'}`}>
          {/* Logo */}
          <Link href={base} className="flex items-center gap-2 flex-shrink-0">
            {theme.store?.logo ? (
              <Image src={theme.store.logo} alt={merchant.storeName} width={120} height={40} className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-xl font-bold" style={{ color: theme.colors.primary, fontFamily: `var(--font-heading)` }}>
                {merchant.storeName}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: theme.colors.text }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {theme.header?.showSearch && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg transition-colors hover:opacity-70"
                style={{ color: theme.colors.text }}
              >
                <Search className="w-5 h-5" />
              </button>
            )}

            {/* Wishlist */}
            {theme.header?.showWishlist && (
              <button className="hidden md:flex p-2 rounded-lg transition-colors hover:opacity-70" style={{ color: theme.colors.text }}>
                <Heart className="w-5 h-5" />
              </button>
            )}

            {/* Cart */}
            {theme.header?.showCart && (
              <Link href={`${base}/cart`} className="relative p-2 rounded-lg transition-colors hover:opacity-70" style={{ color: theme.colors.text }}>
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: theme.colors.text }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar (expanded) */}
        {searchOpen && (
          <div className="pb-3">
            <form action={`${base}/products`} method="get" className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.colors.textMuted }} />
              <input
                name="search"
                autoFocus
                placeholder="ابحث عن منتج..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm outline-none border"
                style={{
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }}
              />
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t" style={{ borderColor: theme.colors.border }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2.5 text-sm font-medium"
                style={{ color: theme.colors.text }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
