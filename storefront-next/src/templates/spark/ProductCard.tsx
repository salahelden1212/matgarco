import Link from 'next/link';
import Image from 'next/image';
import type { ThemeData } from '@/types/theme';

interface Props {
  product: any;
  theme: ThemeData;
  subdomain: string;
  style?: 'default' | 'compact' | 'horizontal';
}

function getImageUrl(img: any): string {
  if (!img) return '';
  return typeof img === 'string' ? img : img.url || '';
}

export default function ProductCard({ product, theme, subdomain, style = 'default' }: Props) {
  const image        = getImageUrl(product.images?.[0]);
  const hasDiscount  = product.comparePrice && product.comparePrice > product.price;
  const isOutOfStock = product.stock === 0;
  const isNew        = product.createdAt && (Date.now() - new Date(product.createdAt).getTime()) < 1000 * 60 * 60 * 24 * 7; // 7 days

  const href = `/store/${subdomain}/products/${product.slug || product._id}`;

  if (style === 'horizontal') {
    return (
      <Link
        href={href}
        className="flex gap-3 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
      >
        <div className="relative w-24 h-24 flex-shrink-0" style={{ backgroundColor: theme.colors.background }}>
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
          )}
        </div>
        <div className="flex flex-col justify-center p-2">
          <p className="text-sm font-semibold line-clamp-1" style={{ color: theme.colors.text }}>{product.name}</p>
          <p className="text-sm font-bold mt-1" style={{ color: theme.colors.primary }}>
            {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
          </p>
        </div>
      </Link>
    );
  }

  if (style === 'compact') {
    return (
      <Link href={href} className="group block" style={{ color: theme.colors.text }}>
        <div className="relative aspect-square rounded-lg overflow-hidden mb-2" style={{ backgroundColor: theme.colors.background }}>
          {image ? (
            <Image src={image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
        </div>
        <p className="text-xs font-medium truncate">{product.name}</p>
        <p className="text-xs font-bold" style={{ color: theme.colors.primary }}>
          {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
        </p>
      </Link>
    );
  }

  // Default card
  return (
    <Link
      href={href}
      className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
      style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
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
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {isNew && !hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: theme.colors.primary }}>
              جديد
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-500">
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
        {product.category && (
          <p className="text-xs mb-1" style={{ color: theme.colors.textMuted }}>{product.category}</p>
        )}
        <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2" style={{ color: theme.colors.text }}>
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-base" style={{ color: theme.colors.primary }}>
              {product.price?.toLocaleString()} {theme.store?.currency || 'ج'}
            </span>
            {hasDiscount && (
              <span className="text-xs line-through mr-2" style={{ color: theme.colors.textMuted }}>
                {product.comparePrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
