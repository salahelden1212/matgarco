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

export default function BloomFooter({ theme, merchant }: Props) {
  return (
    <footer className="py-12 px-4 text-center" style={{ backgroundColor: theme.colors.primary + '10', borderTop: `1px solid ${theme.colors.primary + '30'}` }}>
      <div className="text-2xl mb-4">✿</div>
      <p className="font-black text-lg mb-2" style={{ color: theme.colors.primary }}>{merchant.storeName}</p>
      <p className="text-sm mb-6" style={{ color: theme.colors.textMuted }}>{theme.store?.description || 'جمالك أولويتنا'}</p>
      <div className="flex justify-center gap-4 mb-6">
        <Link href={`/store/${merchant.subdomain}/products`} className="text-xs hover:underline" style={{ color: theme.colors.text }}>المنتجات</Link>
        <Link href={`/store/${merchant.subdomain}/cart`} className="text-xs hover:underline" style={{ color: theme.colors.text }}>السلة</Link>
      </div>
      {(() => {
        const socials = Object.entries(theme.social || {}).filter(([, v]) => v);
        return socials.length > 0 && (
          <div className="flex justify-center gap-2">
            {socials.map(([platform, url]) => {
              const Icon = SOCIAL_ICONS[platform];
              if (!Icon || !url) return null;
              return (
                <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full transition-opacity hover:opacity-80"
                  style={{ backgroundColor: theme.colors.primary, color: '#fff' }}>
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        );
      })()}
      <p className="text-xs mt-6" style={{ color: theme.colors.textMuted }}>© {new Date().getFullYear()} {merchant.storeName}</p>
    </footer>
  );
}
