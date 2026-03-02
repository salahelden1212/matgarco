import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchStorefrontTheme, fetchPreviewTheme } from '@/lib/api';
import { buildCSSVariables, buildGoogleFontsURL } from '@/lib/theme';
import { CartProvider } from '@/components/CartProvider';
import ThemeDocumentSync from '@/components/ThemeDocumentSync';
import PreviewLinkInterceptor from '@/components/PreviewLinkInterceptor';
import { isPreviewMode } from '@/lib/preview';

interface Props {
  children: React.ReactNode;
  params: { subdomain: string };
}

export async function generateMetadata({ params, searchParams }: any): Promise<Metadata> {
  const isPreview = searchParams?.preview === '1';
  const data = isPreview
    ? await fetchPreviewTheme(params.subdomain)
    : await fetchStorefrontTheme(params.subdomain);

  if (!data) return { title: 'متجر' };

  const { theme, merchant } = data;
  return {
    title: theme.seo?.title || merchant.storeName,
    description: theme.seo?.description || '',
    keywords: theme.seo?.keywords || '',
    openGraph: {
      title: theme.seo?.title || merchant.storeName,
      description: theme.seo?.description || '',
      images: theme.seo?.ogImage ? [{ url: theme.seo.ogImage }] : [],
    },
    icons: theme.seo?.favicon ? { icon: theme.seo.favicon } : undefined,
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const preview = isPreviewMode();
  const data = preview
    ? await fetchPreviewTheme(params.subdomain)
    : await fetchStorefrontTheme(params.subdomain);
  if (!data) notFound();

  const { theme } = data;
  const cssVars  = buildCSSVariables(theme);
  const fontsURL = buildGoogleFontsURL(theme);
  const dir  = theme.store?.direction || 'rtl';
  const lang = theme.store?.language  || 'ar';

  return (
    <>
      {/* Google Fonts via <link> for reliable loading */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={fontsURL} />

      {/* Inject theme CSS variables */}
      <style dangerouslySetInnerHTML={{ __html: cssVars }} />

      {/* Sync document dir/lang on client */}
      <ThemeDocumentSync dir={dir} lang={lang} />

      {/* Keep ?preview=1 on all link clicks inside preview iframe */}
      <PreviewLinkInterceptor />

      {/* Shared cart state across all store pages */}
      <CartProvider>
        {children}
      </CartProvider>
    </>
  );
}
