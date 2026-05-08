import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { Metadata } from 'next';
import { fetchStorefrontTheme, fetchPreviewTheme, fetchMasterThemePreview } from '@/lib/api';
import { buildCSSVariables, buildGoogleFontsURL } from '@/lib/theme';
import { CartProvider } from '@/components/CartProvider';
import ThemeDocumentSync from '@/components/ThemeDocumentSync';
import PreviewLinkInterceptor from '@/components/PreviewLinkInterceptor';
import StorefrontLivePreview from '@/components/StorefrontLivePreview';

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

  const data = masterThemeId
    ? await fetchMasterThemePreview(masterThemeId)
    : isPreview
      ? await fetchPreviewTheme(params.subdomain)
      : await fetchStorefrontTheme(params.subdomain);

  if (!data) return { title: 'معاينة القالب' };
  return { title: data.merchant?.storeName || 'معاينة القالب' };
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
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsURL} />
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      <ThemeDocumentSync dir={dir} lang={lang} />
      <PreviewLinkInterceptor />
      <StorefrontLivePreview />
      <CartProvider>
        {children}
      </CartProvider>
    </>
  );
}
