'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

// Plans that should show "Powered by Matgarco"
const SHOW_POWERED_BY_PLANS = ['free_trial', 'starter'];

export default function FooterSection({ settings = {}, storeData }: { settings: Record<string, any>, storeData?: any }) {
  const merchant = storeData?.merchant || {};
  const currentYear = new Date().getFullYear();
  
  // Check if we should show "Powered by Matgarco"
  const subscriptionPlan = merchant.subscriptionPlan || 'free_trial';
  const showPoweredBy = SHOW_POWERED_BY_PLANS.includes(subscriptionPlan);
  
  const { 
    aboutText = 'متجر يوفر لك أفضل المنتجات بأعلى جودة. تسوق الآن واحصل على عروض حصرية.',
    backgroundColor = 'var(--surface)',
    textColor = 'var(--text)',
    showNewsletter = true,
    showSocialLinks = true,
    socialLinks = {},
  } = settings;

  // Determine if we're using dark theme (to adjust text colors)
  const isDarkTheme = backgroundColor?.includes('0f172a') || backgroundColor?.includes('1e293b') || backgroundColor?.includes('000');
  const textColorClass = isDarkTheme ? 'text-white' : 'text-[var(--text)]';
  const mutedColorClass = isDarkTheme ? 'text-white/60' : 'text-[var(--text-muted)]';
  const borderColorClass = isDarkTheme ? 'border-white/10' : 'border-[var(--border)]';

  return (
    <footer 
      style={{ backgroundColor }} 
      className={`pt-12 md:pt-16 pb-6 md:pb-8 border-t ${borderColorClass} relative z-10 w-full mt-auto`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-10 md:mb-12">
          
          {/* Column 1: Logo & About */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className={`text-2xl md:text-3xl font-bold mb-4 tracking-tight ${textColorClass}`}>
              {merchant.storeName || 'المتجر'}
            </h3>
            <p className={`text-sm md:text-base leading-relaxed mb-6 ${mutedColorClass}`}>
              {aboutText}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {merchant.email && (
                <a 
                  href={`mailto:${merchant.email}`}
                  className={`flex items-center gap-2 text-sm ${mutedColorClass} hover:${textColorClass} transition-colors`}
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="break-all">{merchant.email}</span>
                </a>
              )}
              {merchant.phone && (
                <a 
                  href={`tel:${merchant.phone}`}
                  className={`flex items-center gap-2 text-sm ${mutedColorClass} hover:${textColorClass} transition-colors`}
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{merchant.phone}</span>
                </a>
              )}
              {merchant.address && (
                <p className={`flex items-start gap-2 text-sm ${mutedColorClass}`}>
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{merchant.address.city}، {merchant.address.country}</span>
                </p>
              )}
            </div>

            {/* Social Links */}
            {showSocialLinks && (
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.facebook && (
                  <a 
                    href={socialLinks.facebook} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`p-2 rounded-full ${isDarkTheme ? 'bg-white/10 hover:bg-white/20' : 'bg-[var(--background)] hover:bg-[var(--border)]'} transition-colors`}
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.instagram && (
                  <a 
                    href={socialLinks.instagram} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`p-2 rounded-full ${isDarkTheme ? 'bg-white/10 hover:bg-white/20' : 'bg-[var(--background)] hover:bg-[var(--border)]'} transition-colors`}
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {socialLinks.twitter && (
                  <a 
                    href={socialLinks.twitter} 
                    target="_blank" 
                    rel="noreferrer"
                    className={`p-2 rounded-full ${isDarkTheme ? 'bg-white/10 hover:bg-white/20' : 'bg-[var(--background)] hover:bg-[var(--border)]'} transition-colors`}
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className={`font-bold text-base md:text-lg mb-4 ${textColorClass}`}>روابط سريعة</h4>
            <ul className="space-y-3">
              {[
                { label: 'الرئيسية', href: '/' },
                { label: 'المنتجات', href: '/products' },
                { label: 'التصنيفات', href: '/categories' },
                { label: 'من نحن', href: '/about' },
                { label: 'اتصل بنا', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={merchant.subdomain ? `/store/${merchant.subdomain}${link.href}` : link.href}
                    className={`text-sm ${mutedColorClass} hover:${textColorClass} transition-colors flex items-center gap-2`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkTheme ? 'bg-white/40' : 'bg-[var(--text-muted)]/40'}`}></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Support */}
          <div>
            <h4 className={`font-bold text-base md:text-lg mb-4 ${textColorClass}`}>خدمة العملاء</h4>
            <ul className="space-y-3">
              {[
                { label: 'تتبع الطلب', href: '/track-order' },
                { label: 'الأسئلة الشائعة', href: '/faq' },
                { label: 'سياسة الشحن', href: '/shipping' },
                { label: 'سياسة الاسترجاع', href: '/returns' },
                { label: 'سياسة الخصوصية', href: '/privacy' },
                { label: 'شروط الاستخدام', href: '/terms' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={merchant.subdomain ? `/store/${merchant.subdomain}${link.href}` : link.href}
                    className={`text-sm ${mutedColorClass} hover:${textColorClass} transition-colors flex items-center gap-2`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isDarkTheme ? 'bg-white/40' : 'bg-[var(--text-muted)]/40'}`}></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          {showNewsletter && (
            <div>
              <h4 className={`font-bold text-base md:text-lg mb-4 ${textColorClass}`}>القائمة البريدية</h4>
              <p className={`text-sm mb-4 ${mutedColorClass}`}>
                اشترك معنا الآن ليصلك كل جديد وعروض حصرية.
              </p>
              <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="بريدك الإلكتروني" 
                  className={`px-4 py-2.5 w-full rounded-lg text-sm ${isDarkTheme ? 'bg-white/10 text-white placeholder:text-white/50' : 'bg-[var(--background)] text-[var(--text)] placeholder:text-[var(--text-muted)]'} border ${borderColorClass} focus:border-[var(--primary)] focus:outline-none transition-colors`}
                />
                <button 
                  type="submit" 
                  className="px-4 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white font-bold text-sm rounded-lg transition-opacity"
                >
                  اشترك الآن
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className={`pt-6 md:pt-8 border-t ${borderColorClass} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <p className={`text-xs md:text-sm ${mutedColorClass}`}>
            © {currentYear} {merchant.storeName || 'المتجر'}. جميع الحقوق محفوظة.
          </p>
          
          {/* Powered by Matgarco - Only for free_trial and starter plans */}
          {showPoweredBy && (
            <div className={`flex items-center gap-2 text-xs ${mutedColorClass} px-3 py-1.5 rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-[var(--background)]'}`}>
              <span>Powered by</span>
              <a 
                href="https://matgarco.com" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold hover:text-[var(--primary)] transition-colors"
              >
                Matgarco
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
