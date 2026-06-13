import { fetchProducts, fetchStorefrontTheme, fetchMasterThemePreview, fetchPreviewTheme, fetchCategories } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import StorePageShell from '@/components/StorePageShell';
import { ProductCard } from '@/components/theme/ProductCard';
import { ShoppingBag, ChevronLeft, Search, Filter, Folder, Tag, X } from 'lucide-react';

interface Props {
  params: { subdomain: string };
  searchParams: { q?: string; sort?: string; page?: string; category?: string; preview?: string; master_theme_id?: string };
}

export default async function ProductsPage({ params, searchParams }: Props) {
  const { subdomain } = params;
  const isPreview = searchParams.preview === '1';
  const masterThemeId = searchParams.master_theme_id;
  const isMasterPreview = isPreview && !!masterThemeId;
  const currentPage = parseInt(searchParams.page || '1');

  // In master preview mode, use demo products (no real merchant needed)
  const realSubdomain = isMasterPreview ? 'demo' : subdomain;

  const themeRes = isMasterPreview
    ? await fetchMasterThemePreview(masterThemeId!)
    : isPreview
      ? await fetchPreviewTheme(subdomain)
      : await fetchStorefrontTheme(subdomain);

  if (!themeRes) return notFound();

  const [productsRes, categoriesRes] = await Promise.all([
    fetchProducts(realSubdomain, {
      search:   searchParams.q,
      sort:     searchParams.sort,
      category: searchParams.category,
      page:     currentPage,
      limit:    20,
    }),
    fetchCategories(realSubdomain).catch(() => []),
  ]);

  const products = productsRes?.products || [];
  const total    = productsRes?.pagination?.total || 0;
  const categoriesList = categoriesRes || [];

  // Helper to construct query strings
  const getQueryString = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (searchParams.q) params.set('q', searchParams.q);
    if (searchParams.sort) params.set('sort', searchParams.sort);
    if (searchParams.category) params.set('category', searchParams.category);
    
    Object.keys(overrides).forEach(key => {
      const val = overrides[key];
      if (val === null) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    const str = params.toString();
    return str ? `?${str}` : '';
  };

  return (
    <StorePageShell subdomain={subdomain}>
      <div className="px-4 max-w-7xl mx-auto pb-16 pt-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs md:text-sm mb-6 text-slate-500 font-medium">
          <Link href={`/store/${subdomain}`} className="hover:text-slate-900 transition-colors">الرئيسية</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold">المنتجات</span>
        </nav>

        {/* Header + Filters info */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 font-heading tracking-tight">
              {searchParams.category ? `قسم: ${searchParams.category}` : 'جميع المنتجات'}
            </h1>
            <p className="text-xs md:text-sm mt-1.5 text-slate-500 font-semibold">{total} منتج متاح</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <form method="GET" className="relative">
              {searchParams.sort     && <input type="hidden" name="sort"     value={searchParams.sort} />}
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <div className="relative">
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="ابحث عن منتج..."
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl text-sm outline-none bg-slate-50 text-slate-800 border border-slate-200 focus:border-slate-800 focus:bg-white transition-all duration-200 font-medium"
                  style={{ minWidth: '240px' }}
                />
              </div>
            </form>

            {/* Sort */}
            <form method="GET" className="flex items-center gap-2">
              {searchParams.q        && <input type="hidden" name="q"        value={searchParams.q} />}
              {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
              <select
                name="sort"
                defaultValue={searchParams.sort || 'newest'}
                className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer bg-slate-50 text-slate-800 border border-slate-200 focus:border-slate-800 transition-colors font-medium"
              >
                <option value="featured">المميزة</option>
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
                <option value="popular">الأكثر مبيعًا</option>
                <option value="name_asc">الاسم: أ-ي</option>
              </select>
              <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all duration-200 shadow-sm">
                تصفية
              </button>
            </form>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left/Right Sidebar (Filter by Category) */}
          <aside className="col-span-1 hidden lg:block">
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm sticky top-24">
              <h3 className="font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Filter className="w-4.5 h-4.5 text-slate-500" />
                تصفية حسب الأقسام
              </h3>
              
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href={getQueryString({ category: null })}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all font-bold ${
                      !searchParams.category 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>جميع الأقسام</span>
                    <Folder className="w-4 h-4 opacity-70" />
                  </Link>
                </li>
                
                {categoriesList.map((cat: any, i: number) => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const isActive = searchParams.category === catName;
                  return (
                    <li key={i}>
                      <Link
                        href={getQueryString({ category: catName })}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all font-bold ${
                          isActive 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <span className="truncate">{catName}</span>
                        <Tag className="w-4 h-4 opacity-70" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {/* Active Filters Bar */}
            {(searchParams.category || searchParams.q) && (
              <div className="flex flex-wrap gap-2 items-center mb-6">
                <span className="text-xs font-bold text-slate-400 ml-1">الفلاتر النشطة:</span>
                {searchParams.category && (
                  <Link 
                    href={getQueryString({ category: null })} 
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    <span>القسم: {searchParams.category}</span>
                    <X className="w-3.5 h-3.5" />
                  </Link>
                )}
                {searchParams.q && (
                  <Link 
                    href={getQueryString({ q: null })} 
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors px-3 py-1.5 rounded-full text-xs font-bold"
                  >
                    <span>بحث: {searchParams.q}</span>
                    <X className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Mobile Category Quick Filter slider */}
            {categoriesList.length > 0 && (
              <div className="lg:hidden mb-6 overflow-x-auto flex gap-2 pb-2 hide-scrollbar">
                <Link
                  href={getQueryString({ category: null })}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                    !searchParams.category 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  الكل
                </Link>
                {categoriesList.map((cat: any, i: number) => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  const isActive = searchParams.category === catName;
                  return (
                    <Link
                      key={i}
                      href={getQueryString({ category: catName })}
                      className={`px-4 py-2 rounded-full text-xs font-extrabold shrink-0 border transition-all ${
                        isActive 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {catName}
                    </Link>
                  );
                })}
              </div>
            )}

            {products.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl p-8 max-w-lg mx-auto">
                <ShoppingBag className="w-16 h-16 mx-auto text-slate-350 mb-4 stroke-[1.2]" />
                <p className="text-xl font-black text-slate-855 mb-2">لا توجد منتجات مطابقة لعملية البحث</p>
                <p className="text-sm text-slate-400 mb-6 font-medium">جرب استخدام كلمات مفتاحية أخرى أو تصفح الأقسام العامة.</p>
                {(searchParams.q || searchParams.category) && (
                  <Link
                    href={`/store/${subdomain}/products`}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-slate-800 transition-all duration-200"
                  >
                    عرض كل المنتجات
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map((product: any, i: number) => (
                  <ProductCard key={product._id} product={product} priority={i < 4} />
                ))}
              </div>
            )}

            {/* Pagination (Simple Next/Prev) */}
            {total > 20 && (
              <div className="flex justify-center gap-4 mt-16 border-t border-slate-100 pt-8">
                {currentPage > 1 && (
                  <Link
                    href={getQueryString({ page: String(currentPage - 1) })}
                    className="px-6 py-3 rounded-xl text-sm font-extrabold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    السابق
                  </Link>
                )}
                {total > currentPage * 20 && (
                  <Link
                    href={getQueryString({ page: String(currentPage + 1) })}
                    className="px-6 py-3 rounded-xl text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-colors"
                  >
                    التالي
                  </Link>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </StorePageShell>
  );
}ver:bg-slate-800 shadow-md transition-colors"
              >
                التالي
              </Link>
            )}
          </div>
        )}
      </div>
    </StorePageShell>
  );
}
