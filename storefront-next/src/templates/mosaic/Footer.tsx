import Link from 'next/link';
import type { ThemeData } from '@/types/theme';
import { LayoutGrid } from 'lucide-react';

interface Props { theme: ThemeData; merchant: { storeName: string; subdomain: string } }

export default function MosaicFooter({ theme, merchant }: Props) {
  return (
    <footer className="py-10 px-4" style={{ backgroundColor: theme.colors.surface, borderTop: `1px solid ${theme.colors.border}` }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3 font-black text-lg" style={{ color: theme.colors.primary }}>
            <LayoutGrid className="w-5 h-5" />
            {merchant.storeName}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: theme.colors.textMuted }}>{theme.store?.description || 'كل ما تحتاجه في مكان واحد.'}</p>
        </div>
        <div>
          <h5 className="font-bold text-sm mb-3" style={{ color: theme.colors.text }}>تصفح</h5>
          <Link href={`/store/${merchant.subdomain}/products`} className="block text-xs py-1 hover:underline" style={{ color: theme.colors.textMuted }}>جميع المنتجات</Link>
          <Link href={`/store/${merchant.subdomain}/cart`} className="block text-xs py-1 hover:underline" style={{ color: theme.colors.textMuted }}>السلة</Link>
        </div>
        <div>
          {theme.store?.email && (
            <>
              <h5 className="font-bold text-sm mb-3" style={{ color: theme.colors.text }}>تواصل</h5>
              <p className="text-xs" style={{ color: theme.colors.textMuted }}>{theme.store.email}</p>
            </>
          )}
        </div>
      </div>
      <div className="mt-8 pt-4 border-t text-xs text-center" style={{ borderColor: theme.colors.border, color: theme.colors.textMuted }}>
        © {new Date().getFullYear()} {merchant.storeName}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
