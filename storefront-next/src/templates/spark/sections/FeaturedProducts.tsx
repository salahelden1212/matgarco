import Link from 'next/link';
import Image from 'next/image';
import type { ThemeData } from '@/types/theme';

interface Props {
  config: { title?: string; style?: 'grid' | 'carousel'; limit?: number };
  theme: ThemeData;
  products: any[];
  subdomain: string;
}

function getImageUrl(img: any): string {
  if (!img) return '';
  return typeof img === 'string' ? img : img.url || '';
}

function SparkProductCard({ product, theme, subdomain }: { product: any; theme: ThemeData; subdomain: string }) {
  const image     = getImageUrl(product.images?.[0]);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <Link
      href={`/store/${subdomain}/products/${product.slug || product._id}`}
      className="group block rounded-2xl overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
      style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#EF4444' }}>
              خصم
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gray-500">
              نفذ
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: theme.colors.text }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base" style={{ color: theme.colors.primary }}>
            {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through" style={{ color: theme.colors.textMuted }}>
              {product.comparePrice?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedProducts({ config, theme, products, subdomain }: Props) {
  const title   = config.title || 'منتجات مميزة';
  const limit   = config.limit || 8;
  const visible = products.slice(0, limit);

  if (!visible.length) return null;

  return (
    <section className="py-14 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}>
          {title}
        </h2>
        <Link
          href={`/store/${subdomain}/products`}
          className="text-sm font-medium hover:underline"
          style={{ color: theme.colors.primary }}
        >
          عرض الكل ←
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visible.map((product: any) => (
          <SparkProductCard key={product._id} product={product} theme={theme} subdomain={subdomain} />
        ))}
      </div>
    </section>
  );
}
