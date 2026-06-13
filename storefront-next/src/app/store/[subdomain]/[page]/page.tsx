import { fetchStorefrontTheme, fetchPreviewTheme, fetchMasterThemePreview } from '@/lib/api';
import { notFound } from 'next/navigation';
import ThemeRenderer from '@/components/theme/ThemeRenderer';
import StorePageShell from '@/components/StorePageShell';
import Link from 'next/link';

interface Props {
  params: { subdomain: string; page: string };
  searchParams: { preview?: string; master_theme_id?: string };
}

export const revalidate = 60;

export default async function GenericStorePage({ params, searchParams }: Props) {
  const { subdomain, page } = params;
  const isPreview = searchParams.preview === '1';

  // Protect against reserved or non-existent page slugs globally
  const validPages = ['about', 'contact', 'faq', 'terms', 'privacy', 'shipping', 'returns'];
  if (!validPages.includes(page)) {
    return notFound();
  }

  const themeRes = isPreview && searchParams.master_theme_id
    ? await fetchMasterThemePreview(searchParams.master_theme_id)
    : isPreview 
      ? await fetchPreviewTheme(subdomain) 
      : await fetchStorefrontTheme(subdomain);

  if (!themeRes) return notFound();

  // Load page data (e.g., 'about' or 'contact')
  const pageData = themeRes.theme?.pages?.[page] || {};
  
  // If explicitly disabled by merchant, return 404
  if (pageData.enabled === false) {
    return notFound();
  }

  let sections = pageData.sections;

  // Render rich text content layout if sections are empty or contain only header/footer
  const hasSections = Array.isArray(sections) && sections.filter((s: any) => s.type !== 'header' && s.type !== 'footer').length > 0;

  if (!hasSections && pageData.content) {
    return (
      <StorePageShell subdomain={subdomain}>
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm mb-6 text-slate-500 font-medium">
            <Link href={`/store/${subdomain}`} className="hover:text-slate-900 transition-colors">الرئيسية</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">{pageData.title || page}</span>
          </nav>

          <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 pb-4 border-b border-slate-150 font-heading tracking-tight">
              {pageData.title || page}
            </h1>
            <div 
              className="prose prose-slate max-w-none text-slate-650 leading-relaxed text-sm md:text-base font-semibold space-y-4"
              dangerouslySetInnerHTML={{ __html: pageData.content }}
            />
          </div>
        </div>
      </StorePageShell>
    );
  }

  // Provide a smart default structure if the page hasn't been designed/populated yet
  if (!sections || sections.length === 0) {
    if (page === 'about') {
      sections = [
        { id: 'hdr', type: 'header', settings: {} },
        { 
          id: 'about-img-text', 
          type: 'image_with_text', 
          settings: { 
            title: 'قصتنا', 
            text: 'نحن متجر مصمم بالشغف لنقدم لك أفضل الخدمات المتنوعة والمنتجات المميزة.' 
          } 
        },
        { id: 'ftr', type: 'footer', settings: {} }
      ];
    } else {
      sections = [
        { id: 'hdr', type: 'header', settings: {} },
        { id: 'ftr', type: 'footer', settings: {} }
      ];
    }
  }

  return (
    <StorePageShell subdomain={subdomain}>
      <ThemeRenderer 
        sections={sections} 
        storeData={themeRes.theme?.store || {}} 
      />
    </StorePageShell>
  );
}
