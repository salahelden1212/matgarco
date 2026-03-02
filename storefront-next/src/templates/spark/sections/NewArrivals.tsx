import Link from 'next/link';
import Image from 'next/image';
import type { ThemeData } from '@/types/theme';

interface Props {
  config: { title?: string; limit?: number };
  theme: ThemeData;
  products: any[];
  subdomain: string;
}

function getImageUrl(img: any): string {
  if (!img) return '';
  return typeof img === 'string' ? img : img.url || '';
}

export default function NewArrivals({ config, theme, products, subdomain }: Props) {
  const title = config.title || 'وصل حديثاً';
  const limit = config.limit || 6;
  // Show last N products (newest first assuming sorted by API)
  const visible = [...products].slice(0, limit);

  if (!visible.length) return null;

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}>
            {title}
          </h2>
          <div className="w-12 h-1 rounded-full mt-2" style={{ backgroundColor: theme.colors.primary }} />
        </div>
        <Link href={`/store/${subdomain}/products`} className="text-sm font-medium hover:underline" style={{ color: theme.colors.primary }}>
          عرض الكل
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {visible.map((product: any) => {
          const image = getImageUrl(product.images?.[0]);
          return (
            <Link
              key={product._id}
              href={`/store/${subdomain}/products/${product.slug || product._id}`}
              className="group block rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
            >
              <div className="relative aspect-square" style={{ backgroundColor: theme.colors.background }}>
                {image ? (
                  <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate" style={{ color: theme.colors.text }}>{product.name}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: theme.colors.primary }}>
                  {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
