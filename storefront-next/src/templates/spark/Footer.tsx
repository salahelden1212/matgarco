import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { Instagram, Twitter, Facebook, Youtube } from 'lucide-react';

interface Props {
  theme: ThemeData;
  merchant: { storeName: string; subdomain: string; logo: string };
}

const SOCIAL_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

export default function Footer({ theme, merchant }: Props) {
  const style    = theme.footer?.style || 'full';
  const subdomain = merchant.subdomain;

  if (style === 'minimal') {
    return (
      <footer className="py-6 px-4 text-center text-sm" style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}>
        <p>© {new Date().getFullYear()} {theme.store?.name || 'متجرنا'}. جميع الحقوق محفوظة.</p>
      </footer>
    );
  }

  const socials = theme.social || {};
  const socialEntries = Object.entries(socials).filter(([, v]) => v);

  return (
    <footer style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {theme.header?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={theme.header.logoUrl} alt={theme.store?.name} className="h-8 object-contain" />
            ) : (
              <span className="font-black text-xl" style={{ color: theme.colors.primary }}>
                {theme.store?.name || 'متجرنا'}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>
            {theme.store?.description || 'نقدم لك أفضل المنتجات بأعلى جودة وأسعار منافسة.'}
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-bold text-sm mb-4" style={{ color: theme.colors.text }}>روابط سريعة</h4>
          <ul className="space-y-2 text-sm" style={{ color: theme.colors.textMuted }}>
            <li><Link href={`/store/${subdomain}/products`} className="hover:underline">جميع المنتجات</Link></li>
            <li><Link href={`/store/${subdomain}/cart`} className="hover:underline">سلة التسوق</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-sm mb-4" style={{ color: theme.colors.text }}>تواصل معنا</h4>
          <ul className="space-y-2 text-sm" style={{ color: theme.colors.textMuted }}>
            {theme.store?.phone && <li>📞 {theme.store.phone}</li>}
            {theme.store?.email && <li>✉️ {theme.store.email}</li>}
            {theme.store?.address && <li>📍 {theme.store.address}</li>}
          </ul>
        </div>

        {/* Social */}
        {socialEntries.length > 0 && (
          <div>
            <h4 className="font-bold text-sm mb-4" style={{ color: theme.colors.text }}>تابعنا</h4>
            <div className="flex gap-3">
              {socialEntries.map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform];
                if (!Icon || !url) return null;
                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ backgroundColor: theme.colors.primary + '15', color: theme.colors.primary }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div
        className="py-4 px-4 text-center text-xs"
        style={{ borderTop: `1px solid ${theme.colors.border}`, color: theme.colors.textMuted }}
      >
        © {new Date().getFullYear()} {theme.store?.name || 'متجرنا'}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
