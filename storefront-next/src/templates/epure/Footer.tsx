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

export default function EpureFooter({ theme, merchant }: Props) {
  return (
    <footer className="py-16 px-6" style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
        <div>
          <p className="font-black text-xl uppercase tracking-widest mb-4" style={{ color: theme.colors.text }}>{merchant.storeName}</p>
          <p className="text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>{theme.store?.description || 'أزياء مُختارة بعناية.'}</p>
        </div>
        <div>
          <h5 className="text-xs uppercase tracking-widest mb-4 font-bold" style={{ color: theme.colors.textMuted }}>Navigation</h5>
          <Link href={`/store/${merchant.subdomain}/products`} className="block text-sm py-1 hover:underline" style={{ color: theme.colors.text }}>Shop All</Link>
          <Link href={`/store/${merchant.subdomain}/cart`} className="block text-sm py-1 hover:underline" style={{ color: theme.colors.text }}>Cart</Link>
        </div>
        <div>
          <h5 className="text-xs uppercase tracking-widest mb-4 font-bold" style={{ color: theme.colors.textMuted }}>Contact</h5>
          {theme.store?.email && <p className="text-sm py-1" style={{ color: theme.colors.text }}>{theme.store.email}</p>}
          {(() => {
            const socials = Object.entries(theme.social || {}).filter(([, v]) => v);
            return socials.length > 0 && (
              <div className="flex gap-3 mt-4">
                {socials.map(([platform, url]) => {
                  const Icon = SOCIAL_ICONS[platform];
                  if (!Icon || !url) return null;
                  return (
                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: theme.colors.text }}>
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-12 pt-6 border-t text-xs" style={{ borderColor: theme.colors.border, color: theme.colors.textMuted }}>
        © {new Date().getFullYear()} {merchant.storeName}
      </div>
    </footer>
  );
}
