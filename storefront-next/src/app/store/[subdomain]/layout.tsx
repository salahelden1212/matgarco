import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { fetchStorefrontTheme, fetchPreviewTheme, fetchMasterThemePreview } from '@/lib/api';
import { buildCSSVariables, buildGoogleFontsURL } from '@/lib/theme';
import { CartProvider } from '@/components/CartProvider';
import ThemeDocumentSync from '@/components/ThemeDocumentSync';
import PreviewLinkInterceptor from '@/components/PreviewLinkInterceptor';
import StorefrontLivePreview from '@/components/StorefrontLivePreview';
import { I18nWrapper } from '@/lib/i18n/I18nWrapper';

interface Props {
  children: React.ReactNode;
  params: { subdomain: string };
  // Note: Next.js 14 does NOT pass searchParams to layouts — only pages.
  // We rely on x-master-theme / x-preview headers set by the middleware.
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const masterThemeId = searchParams?.master_theme_id;
  const isPreview     = searchParams?.preview === '1';
  const subdomain     = params.subdomain;
  const baseUrl       = process.env.NEXT_PUBLIC_SITE_URL || `https://${subdomain}.matgarco.com`;

  const data = masterThemeId
    ? await fetchMasterThemePreview(masterThemeId)
    : isPreview
      ? await fetchPreviewTheme(subdomain)
      : await fetchStorefrontTheme(subdomain);

  if (!data) return { title: 'معاينة القالب' };

  const storeName   = data.merchant?.storeName || 'المتجر';
  const description = data.merchant?.seoDescription || `تسوق عبر متجر ${storeName} — أفضل المنتجات بأفضل الأسعار`;
  const ogImage     = data.merchant?.ogImage || data.theme?.globalSettings?.seo?.ogImage;

  return {
    title: storeName,
    description,
    metadataBase: new URL(baseUrl),
    alternates: { canonical: baseUrl },
    openGraph: {
      title: storeName,
      description,
      type: 'website',
      locale: data.theme?.globalSettings?.layout?.language === 'en' ? 'en_US' : 'ar_EG',
      siteName: storeName,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: storeName,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: isPreview ? { index: false, follow: false } : { index: true, follow: true },
    other: { 'store:subdomain': subdomain },
  };
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default async function StoreLayout({ children, params }: Props) {
  // CRITICAL: use top-level import — NOT require() — so App Router can read headers
  const h             = headers();
  const masterThemeId = h.get('x-master-theme');
  const isPreview     = h.get('x-preview') === '1';

  let data = masterThemeId
    ? await fetchMasterThemePreview(masterThemeId)
    : isPreview
      ? await fetchPreviewTheme(params.subdomain)
      : await fetchStorefrontTheme(params.subdomain);

  // Special case: "demo-preview" is a virtual subdomain used by the Super Admin
  // ThemeMaker iframe. It has no real merchant, so we fall back to master theme.
  if (!data && params.subdomain === 'demo-preview' && masterThemeId) {
    data = await fetchMasterThemePreview(masterThemeId);
  }

  if (!data) notFound();

  // All data paths now return the same normalized shape via fetchMasterThemePreview
  const safeTheme: any = data!.theme ?? {};

  const cssVars  = buildCSSVariables(safeTheme);
  const fontsURL = buildGoogleFontsURL(safeTheme);

  const dir  = safeTheme?.globalSettings?.layout?.direction ?? 'rtl';
  const lang = safeTheme?.globalSettings?.layout?.language  ?? 'ar';

  return (
    <>
      <link rel="preload" as="style" href={fontsURL} />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsURL} />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <ThemeDocumentSync dir={dir} lang={lang} />
      <PreviewLinkInterceptor />
      <StorefrontLivePreview />
      <CartProvider>
        <I18nWrapper locale={lang as 'ar' | 'en'}>
          {children}
        </I18nWrapper>
      </CartProvider>
    </>
  );
}
