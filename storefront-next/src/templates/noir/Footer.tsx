import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { Instagram, Twitter, Facebook, Youtube, Music2, MessageCircle } from 'lucide-react';

const SOCIAL_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: Music2,
  whatsapp: MessageCircle,
};

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function NoirFooter({ theme, merchant }: Props) {
  return (
    <footer style={{ backgroundColor: '#080808', borderTop: `1px solid ${theme.colors.primary}40` }}>
      <div className="max-w-7xl mx-auto px-8 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <p className="text-xl font-light uppercase tracking-[0.3em] mb-4" style={{ color: theme.colors.primary }}>
            {merchant.storeName}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#555' }}>
            {theme.store?.description || 'الرقي في كل تفصيلة.'}
          </p>
        </div>
        <div>
          <h5 className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: theme.colors.primary }}>Navigation</h5>
          <div className="space-y-3">
            <Link href={`/store/${merchant.subdomain}/products`} className="block text-xs uppercase tracking-wider text-gray-500 hover:text-white transition-colors">Shop</Link>
            <Link href={`/store/${merchant.subdomain}/cart`} className="block text-xs uppercase tracking-wider text-gray-500 hover:text-white transition-colors">Cart</Link>
          </div>
        </div>
        <div>
          {theme.store?.email && (
            <>
              <h5 className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: theme.colors.primary }}>Contact</h5>
              <p className="text-xs text-gray-500">{theme.store.email}</p>
            </>
          )}
          {(() => {
            const socials = Object.entries(theme.social || {}).filter(([, v]) => v);
            return socials.length > 0 && (
              <div className="flex gap-2 mt-6">
                {socials.map(([platform, url]) => {
                  const Icon = SOCIAL_ICONS[platform];
                  if (!Icon || !url) return null;
                  return (
                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded transition-colors hover:bg-white/10"
                      style={{ color: theme.colors.primary }}>
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
      <div className="border-t py-5 text-center text-[10px] text-gray-700 uppercase tracking-widest" style={{ borderColor: '#222' }}>
        © {new Date().getFullYear()} {merchant.storeName} — All Rights Reserved
      </div>
    </footer>
  );
}
