import Link from 'next/link';
import type { ThemeData } from '@/types/theme';

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
        </div>
      </div>
      <div className="border-t py-5 text-center text-[10px] text-gray-700 uppercase tracking-widest" style={{ borderColor: '#222' }}>
        © {new Date().getFullYear()} {merchant.storeName} — All Rights Reserved
      </div>
    </footer>
  );
}
