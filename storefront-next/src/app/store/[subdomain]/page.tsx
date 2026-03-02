import { notFound } from 'next/navigation';
import { fetchStorefrontTheme, fetchPreviewTheme, fetchProducts } from '@/lib/api';
import type { TemplateId } from '@/lib/templates/registry';

interface Props {
  params: { subdomain: string };
  searchParams: { preview?: string };
}

export default async function StorefrontHomePage({ params, searchParams }: Props) {
  const isPreview = searchParams?.preview === '1';
  const { subdomain } = params;

  const data = isPreview
    ? await fetchPreviewTheme(subdomain)
    : await fetchStorefrontTheme(subdomain);

  if (!data) notFound();

  const { theme, merchant } = data;
  const templateId = (theme.templateId || 'spark') as TemplateId;

  // Fetch featured products for homepage sections
  const productsData = await fetchProducts(subdomain, { limit: 12, status: 'active' });
  const products = productsData?.products || [];

  // Dynamically load the right template
  const { default: HomePage } = await import(`@/templates/${templateId}/HomePage`);

  return (
    <HomePage
      theme={theme}
      merchant={merchant}
      products={products}
      isPreview={isPreview}
    />
  );
}
