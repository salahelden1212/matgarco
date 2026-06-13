'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu, User, X, Mail, Phone, ShoppingCart, LogOut, Heart, SearchCheck, MapPin } from 'lucide-react';
import { useCart } from '@/components/CartProvider';

interface HeaderProps {
  id?: string;
  variant?: string;
  settings: Record<string, any>;
  blocks?: any[];
  storeData?: any;
}

export default function HeaderSection({ variant = 'split', settings = {}, storeData }: HeaderProps) {
  const merchant = storeData?.merchant || {};
  let cart = { totalItems: 0, totalPrice: 0 };
  
  try {
    const cartData = useCart();
    if (cartData) {
      cart = {
        totalItems: cartData.totalItems,
        totalPrice: cartData.totalPrice
      };
    }
  } catch (e) {
    // Fallback if rendered outside CartProvider
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcementClosed, setAnnouncementClosed] = useState(false);

  const {
    logoUrl,
    logoWidth = 120,
    isSticky = true,
    transparentOnHero = false,
    backgroundColor = '#ffffff',
    textColor = '#111827',
    borderBottom = true,
    showSearch = true,
    showUser = true,
    showCart = true,
    showAnnouncement = false,
    announcementText = 'شحن مجاني على الطلبات فوق 200 جنيه',
  } = settings;

  const displayLogo = logoUrl || merchant.logo;
  const base = merchant.subdomain ? `/store/${merchant.subdomain}` : '';

  const bgStyle: React.CSSProperties = {
    backgroundColor: transparentOnHero ? 'transparent' : backgroundColor,
    color: textColor,
    borderBottom: borderBottom ? '1px solid rgba(226, 232, 240, 0.8)' : 'none',
  };

  const logoEl = displayLogo ? (
    <img 
      src={displayLogo} 
      alt={merchant.storeName} 
      className="max-h-12 object-contain transition-transform duration-300 hover:scale-102" 
      style={{ width: `${logoWidth}px` }} 
    />
  ) : (
    <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 bg-clip-text text-transparent">{merchant.storeName || 'المتجر'}</span>
  );

  const actions = (
    <div className="flex items-center gap-2 md:gap-4">
      {showSearch && (
        <button 
          title="بحث" 
          onClick={() => setSearchOpen(true)}
          className="p-2.5 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-700 hover:text-slate-950"
        >
          <Search className="w-5 h-5" />
        </button>
      )}
      {showUser && (
        <Link 
          href={`${base}/account`} 
          title="حسابي" 
          className="p-2.5 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-700 hover:text-slate-950 hidden sm:inline-flex"
        >
          <User className="w-5 h-5" />
        </Link>
      )}
      <Link 
        href={`${base}/wishlist`} 
        title="المفضلة" 
        className="p-2.5 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-700 hover:text-rose-600 inline-flex"
      >
        <Heart className="w-5 h-5" />
      </Link>
      {showCart && (
        <Link 
          href={`${base}/cart`} 
          title="السلة" 
          className="p-2.5 hover:bg-slate-100 rounded-full transition-all duration-200 relative inline-flex items-center text-slate-700 hover:text-slate-950"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-in scale-in duration-200">
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </span>
            )}
          </div>
        </Link>
      )}
    </div>
  );

  const navLinks = (
    <nav className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
      <Link href={base || '/'} className="hover:text-slate-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-950 hover:after:w-full after:transition-all after:duration-300">الرئيسية</Link>
      <Link href={`${base}/products`} className="hover:text-slate-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-950 hover:after:w-full after:transition-all after:duration-300">المنتجات</Link>
      <Link href={`${base}/categories`} className="hover:text-slate-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-950 hover:after:w-full after:transition-all after:duration-300">التصنيفات</Link>
      <Link href={`${base}/about`} className="hover:text-slate-950 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-950 hover:after:w-full after:transition-all after:duration-300">من نحن</Link>
    </nav>
  );

  return (
    <header className={`${isSticky ? 'sticky top-0' : ''} z-50 shadow-sm w-full transition-all duration-300 bg-white`} style={bgStyle}>
      {/* Announcement Bar */}
      {showAnnouncement && announcementText && !announcementClosed && (
        <div className="bg-slate-900 text-white text-center text-xs py-2 px-4 font-bold tracking-wide relative flex items-center justify-center">
          <span>{announcementText}</span>
          <button 
            onClick={() => setAnnouncementClosed(true)}
            className="absolute left-4 p-1 hover:bg-white/10 rounded transition-colors"
            title="إغلاق الإعلان"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      )}

      {/* Top info bar */}
      {variant !== 'minimal' && (merchant.email || merchant.phone) && (
        <div className="hidden md:flex justify-between items-center py-2 px-6 text-xs text-slate-500 border-b border-slate-100 bg-slate-50/50 font-medium">
          <div className="flex gap-6 items-center">
            {merchant.email && (
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> 
                {merchant.email}
              </span>
            )}
            {merchant.phone && (
              <span className="flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> 
                {merchant.phone}
              </span>
            )}
          </div>
          <div className="flex gap-5 items-center">
            <Link href={`${base}/track-order`} className="hover:text-slate-800 transition-colors">تتبع الطلب</Link>
            <span className="text-slate-300">|</span>
            <Link href={`${base}/faq`} className="hover:text-slate-800 transition-colors">الأسئلة الشائعة</Link>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* ─── SPLIT variant: Logo left, Nav center/right ─── */}
        {(variant === 'split' || !variant) && (
          <div className="flex justify-between items-center h-16 md:h-20">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
              aria-label="فتح القائمة"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href={base || '/'} className="flex-shrink-0">{logoEl}</Link>
            {navLinks}
            {actions}
          </div>
        )}

        {/* ─── CENTERED variant: Logo center, Nav below ─── */}
        {variant === 'centered' && (
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="flex justify-between items-center w-full">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
                aria-label="فتح القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 flex justify-center">
                <Link href={base || '/'}>{logoEl}</Link>
              </div>
              {actions}
            </div>
            <div className="border-t border-slate-100 w-full mt-2 pt-2 flex justify-center hidden md:flex">
              {navLinks}
            </div>
          </div>
        )}

        {/* ─── MINIMAL variant: Logo + hamburger only ─── */}
        {variant === 'minimal' && (
          <div className="flex justify-between items-center h-16">
            <Link href={base || '/'} className="flex-shrink-0">{logoEl}</Link>
            <div className="flex items-center gap-2">
              {actions}
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-700"
                aria-label="فتح القائمة"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Search Overlay (Mobile & Desktop) ─── */}
      {searchOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-slate-900">البحث عن المنتجات</h3>
              <button 
                onClick={() => setSearchOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `${base}/products?q=${encodeURIComponent(searchQuery.trim())}`;
                }
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="اكتب اسم المنتج أو الكلمة المفتاحية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 rounded-xl text-slate-900 border border-slate-200 focus:border-slate-800 focus:bg-white focus:outline-none transition-all text-sm font-medium"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md text-sm"
              >
                بحث
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── Mobile Sidebar Navigation Drawer ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300">
            <div>
              {/* Header */}
              <div className="flex justify-between items-center pb-5 border-b border-slate-100">
                <span className="text-xl font-black text-slate-900">{merchant.storeName || 'المتجر'}</span>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-800"
                  aria-label="إغلاق القائمة"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-6 space-y-1">
                <Link 
                  href={base || '/'} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all"
                >
                  <span>الرئيسية</span>
                </Link>
                <Link 
                  href={`${base}/products`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all"
                >
                  <span>المنتجات</span>
                </Link>
                <Link 
                  href={`${base}/categories`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all"
                >
                  <span>التصنيفات</span>
                </Link>
                <Link 
                  href={`${base}/about`} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-extrabold text-sm transition-all"
                >
                  <span>من نحن</span>
                </Link>
                
                {/* Secondary Links */}
                <div className="border-t border-slate-100 pt-4 mt-4 space-y-1">
                  <Link 
                    href={`${base}/track-order`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all"
                  >
                    <span>تتبع الطلب</span>
                  </Link>
                  <Link 
                    href={`${base}/faq`} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-slate-50 text-slate-600 font-bold text-xs transition-all"
                  >
                    <span>الأسئلة الشائعة</span>
                  </Link>
                </div>
              </nav>
            </div>

            {/* Footer / Contact Details */}
            <div className="border-t border-slate-100 pt-5 mt-auto">
              {merchant.email && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 py-1.5">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{merchant.email}</span>
                </div>
              )}
              {merchant.phone && (
                <div className="flex items-center gap-2.5 text-xs text-slate-500 py-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{merchant.phone}</span>
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-4 text-center">
                جميع الحقوق محفوظة {merchant.storeName} &copy; {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
