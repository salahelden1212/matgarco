import { fetchProducts } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StorePageShell from '@/components/StorePageShell';
import { fetchStorefrontTheme } from '@/lib/api';

interface Props {
  params: { subdomain: string };
  searchParams: { q?: string; sort?: string; page?: string; category?: string };
}

function getImageUrl(img: any): string {
  if (!img) return '';
  return typeof img === 'string' ? img : img.url || '';
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { subdomain } = params;
  const currentPage = parseInt(searchParams.page || '1');

  const [themeRes, productsRes] = await Promise.all([
    fetchStorefrontTheme(subdomain),
    fetchProducts(subdomain, {
      search:   searchParams.q,
      sort:     searchParams.sort,
      category: searchParams.category,
      page:     currentPage,
      limit:    20,
    }),
  ]);

  if (!themeRes) return notFound();

  const theme    = themeRes.theme;
  const products = productsRes?.products || [];
  const total    = productsRes?.pagination?.total || 0;

  return (
    <StorePageShell subdomain={subdomain}>
      <div className="px-4 max-w-7xl mx-auto pb-16 pt-6">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: theme.colors.textMuted }}>
          <Link href={`/store/${subdomain}`} className="hover:underline">الرئيسية</Link>
          <span className="mx-2">/</span>
          <span style={{ color: theme.colors.text }}>المنتجات</span>
        </nav>

        {/* Header + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black" style={{ color: theme.colors.text, fontFamily: `var(--font-heading)` }}>
              جميع المنتجات
            </h1>
            <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>{total} منتج</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {/* Search */}
            <form method="GET">
              {searchParams.sort     && <input type="hidden" name="sort"     value={searchParams.sort} />}
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <input
                name="q"
                defaultValue={searchParams.q}
                placeholder="ابحث عن منتج..."
                className="px-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  minWidth: '180px',
                }}
              />
            </form>

            {/* Sort */}
            <form method="GET" id="sort-form">
              {searchParams.q        && <input type="hidden" name="q"        value={searchParams.q} />}
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <select
                name="sort"
                defaultValue={searchParams.sort || 'featured'}
                className="px-4 py-2 rounded-xl text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                }}
              >
                <option value="featured">المميزة</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
                <option value="popular">الأكثر مبيعًا</option>
                <option value="name_asc">الاسم: أ-ي</option>
              </select>
              <button type="submit" className="px-3 py-2 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: theme.colors.primary }}>ترتيب</button>
            </form>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-24" style={{ color: theme.colors.textMuted }}>
            <div className="text-6xl mb-4">🛍️</div>
            <p className="text-xl font-semibold">لا توجد منتجات</p>
            {searchParams.q && (
              <Link
                href={`/store/${subdomain}/products`}
                className="mt-4 inline-block text-sm underline"
                style={{ color: theme.colors.primary }}
              >
                مسح البحث
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product: any) => {
              const image       = getImageUrl(product.images?.[0]);
              const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
              const outOfStock  = (product.quantity ?? product.stock ?? 1) === 0;
              return (
                <Link
                  key={product._id}
                  href={`/store/${subdomain}/products/${product.slug || product._id}`}
                  className="group block rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
                >
                  <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: theme.colors.background }}>
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(max-width:640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-500">خصم</span>
                    )}
                    {outOfStock && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-gray-500">نفذ</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2" style={{ color: theme.colors.text }}>{product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base" style={{ color: theme.colors.primary }}>
                        {product.price?.toLocaleString()} {theme.store?.currency || ''}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs line-through" style={{ color: theme.colors.textMuted }}>
                          {product.compareAtPrice?.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-10">
            {currentPage > 1 && (
              <Link
                href={`?page=${currentPage - 1}${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                className="px-5 py-2 rounded-xl text-sm font-medium"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.text }}
              >
                ← السابق
              </Link>
            )}
            {total > currentPage * 20 && (
              <Link
                href={`?page=${currentPage + 1}${searchParams.q ? `&q=${searchParams.q}` : ''}${searchParams.sort ? `&sort=${searchParams.sort}` : ''}`}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: theme.colors.primary }}
              >
                التالي →
              </Link>
            )}
          </div>
        )}
      </div>
    </StorePageShell>
  );
}
