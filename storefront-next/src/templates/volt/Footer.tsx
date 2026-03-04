import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { Instagram, Twitter, Facebook, Youtube, Music2, MessageCircle, Zap } from 'lucide-react';

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function VoltFooter({ theme, merchant }: Props) {
  const socials = Object.entries(theme.social || {}).filter(([, v]) => v);
  return (
    <footer style={{ backgroundColor: '#111827', borderTop: `2px solid ${theme.colors.primary}` }}>
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 rounded" style={{ backgroundColor: theme.colors.primary }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-xl uppercase tracking-tight text-white">
              {merchant.storeName || 'VOLT'}
            </span>
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            {theme.store?.description || 'متجرك الرياضي المتكامل.'}
          </p>
        </div>
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">روابط</h4>
          <Link href={`/store/${merchant.subdomain}/products`} className="block text-gray-500 text-sm hover:text-white transition-colors py-1">جميع المنتجات</Link>
          <Link href={`/store/${merchant.subdomain}/cart`} className="block text-gray-500 text-sm hover:text-white transition-colors py-1">السلة</Link>
        </div>
        {socials.length > 0 && (
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">تابعنا</h4>
            <div className="flex gap-2">
              {socials.map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform];
                if (!Icon || !url) return null;
                return (
                  <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-md transition-colors hover:bg-white/10"
                    style={{ color: theme.colors.primary }}>
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} {merchant.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
