'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';
import { ShoppingBag, Search, Menu, User, X } from 'lucide-react';

export default function HeaderSection({ settings = {}, storeData }: { settings?: Record<string, any>, storeData?: any }) {
  const merchant = storeData?.merchant || {};
  const { totalItems, totalPrice } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  const { 
    logoUrl,
    logoWidth = 120,
    showSearch = true,
    showUser = true,
    showCart = true,
    backgroundColor = 'var(--background)',
    textColor = 'var(--text)',
  } = settings;

  const displayLogo = logoUrl || merchant.logo;

  return (
    <header className="sticky top-0 z-50 shadow-sm border-b border-[var(--border)]" style={{ backgroundColor, color: textColor }}>
      <div className="container mx-auto px-4">
        {/* Top Info Bar */}
        <div className="hidden md:flex justify-between items-center py-1.5 text-xs text-[var(--text-muted)] border-b border-[var(--border)]">
          <div className="flex gap-4">
            {merchant.email && <span>✉️ {merchant.email}</span>}
            {merchant.phone && <span>📞 {merchant.phone}</span>}
          </div>
          <div className="flex gap-4">
            <span>تتبع الطلب</span>
            <span>الأسئلة الشائعة</span>
          </div>
        </div>

        {/* Main Header */}
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-[var(--text)] hover:opacity-70 transition-opacity"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link href={`/store/${merchant.subdomain}`} className="flex-shrink-0 flex items-center justify-center md:justify-start">
            {displayLogo ? (
              <img 
                src={displayLogo} 
                alt={merchant.storeName} 
                className="max-h-12 object-contain"
                style={{ width: `${logoWidth}px` }}
              />
            ) : (
              <span className="text-2xl font-black tracking-tight text-[var(--text)]">{merchant.storeName || 'المتجر'}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-[var(--text)]">
            <Link href={merchant.subdomain ? `/store/${merchant.subdomain}` : '/'} className="hover:text-[var(--primary)] transition-colors">الرئيسية</Link>
            <Link href={merchant.subdomain ? `/store/${merchant.subdomain}/products` : '/products'} className="hover:text-[var(--primary)] transition-colors">المنتجات</Link>
            <Link href={merchant.subdomain ? `/store/${merchant.subdomain}/categories` : '/categories'} className="hover:text-[var(--primary)] transition-colors">التصنيفات</Link>
            <Link href={merchant.subdomain ? `/store/${merchant.subdomain}/about` : '/about'} className="hover:text-[var(--primary)] transition-colors">من نحن</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5 text-[var(--text)]">
            {showSearch && (
              <button 
                title="بحث"
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-[var(--surface)] hover:text-[var(--primary)] rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            
            {showUser && (
              <button 
                title="حسابي"
                className="p-2 hover:bg-[var(--surface)] hover:text-[var(--primary)] rounded-full transition-colors hidden sm:block"
              >
                <User className="w-5 h-5" />
              </button>
            )}
            
            {showCart && (
              <Link 
                href={merchant.subdomain ? `/store/${merchant.subdomain}/cart` : '/cart'} 
                title="السلة"
                className="p-2 hover:bg-[var(--surface)] hover:text-[var(--primary)] rounded-full transition-colors relative flex items-center gap-2"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center animate-in fade-in zoom-in duration-200">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block font-bold mt-1 text-sm bg-[var(--surface)] px-2 py-0.5 rounded">
                  {totalPrice > 0 ? `${totalPrice.toLocaleString()} ج.م` : '0.00 ج.م'}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border)] bg-[var(--background)]">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <Link 
                href={merchant.subdomain ? `/store/${merchant.subdomain}` : '/'} 
                className="block py-3 px-4 rounded-lg hover:bg-[var(--surface)] text-[var(--text)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                الرئيسية
              </Link>
              <Link 
                href={merchant.subdomain ? `/store/${merchant.subdomain}/products` : '/products'} 
                className="block py-3 px-4 rounded-lg hover:bg-[var(--surface)] text-[var(--text)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                المنتجات
              </Link>
              <Link 
                href={merchant.subdomain ? `/store/${merchant.subdomain}/categories` : '/categories'} 
                className="block py-3 px-4 rounded-lg hover:bg-[var(--surface)] text-[var(--text)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                التصنيفات
              </Link>
              <Link 
                href={merchant.subdomain ? `/store/${merchant.subdomain}/about` : '/about'} 
                className="block py-3 px-4 rounded-lg hover:bg-[var(--surface)] text-[var(--text)] font-medium transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                من نحن
              </Link>
              
              {/* Mobile Contact Info */}
              <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-2">
                {merchant.email && (
                  <p className="text-sm text-[var(--text-muted)] px-4">✉️ {merchant.email}</p>
                )}
                {merchant.phone && (
                  <p className="text-sm text-[var(--text-muted)] px-4">📞 {merchant.phone}</p>
                )}
              </div>
            </nav>
          </div>
        )}

        {/* Search Overlay (Mobile & Desktop) */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-[var(--surface)] border-b border-[var(--border)] shadow-lg p-4 z-50">
            <form 
              action={merchant.subdomain ? `/store/${merchant.subdomain}/products` : '/products'} 
              method="GET"
              className="container mx-auto flex gap-2"
            >
              <input
                type="search"
                name="q"
                placeholder="ابحث عن منتج..."
                className="flex-1 px-4 py-3 rounded-lg bg-[var(--background)] text-[var(--text)] border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                بحث
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="px-4 py-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
