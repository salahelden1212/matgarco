import { fetchProductBySlug, fetchStorefrontTheme } from '@/lib/api';
import { notFound } from 'next/navigation';
import StorePageShell from '@/components/StorePageShell';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { subdomain: string; slug: string };
}

export async function generateMetadata({ params }: Props) {
  const data = await fetchProductBySlug(params.subdomain, params.slug);
  if (!data?.product) return {};
  const { product, merchant } = data;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${params.subdomain}.matgarco.com`;
  const url = `${baseUrl}/products/${params.slug}`;
  const title = product.seo?.title || `${product.name} | ${merchant?.storeName || ''}`;
  const description = product.seo?.description || product.description?.slice(0, 160);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? [{ url: product.images[0], width: 800, height: 800 }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'product',
      images,
      price: { amount: product.price, currency: 'EGP' } as any,
    },
    twitter: { card: 'summary_large_image', title, description, images: images?.map(i => i.url) },
  };
}

function jsonLd(product: any, merchant: any, subdomain: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${subdomain}.matgarco.com`;
  return {
    __html: JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      description: product.description?.slice(0, 500),
      image: Array.isArray(product.images) ? product.images : [product.images].filter(Boolean),
      sku: product.sku || product._id,
      mpn: product._id,
      brand: merchant?.storeName ? { '@type': 'Brand', name: merchant.storeName } : undefined,
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/products/${product.slug || product._id}`,
        priceCurrency: 'EGP',
        price: product.price,
        priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
        availability: product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      aggregateRating: product.rating?.average
        ? { '@type': 'AggregateRating', ratingValue: product.rating.average, reviewCount: product.rating.count || 0 }
        : undefined,
    }),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { subdomain, slug } = params;

  const [themeRes, productData] = await Promise.all([
    fetchStorefrontTheme(subdomain),
    fetchProductBySlug(subdomain, slug),
  ]);

  if (!themeRes || !productData?.product) return notFound();

  const { theme } = themeRes;
  const { product, related: relatedProducts = [] } = productData;

  return (
    <StorePageShell subdomain={subdomain}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(product, productData.merchant || themeRes.merchant, subdomain)}
      />
      <ProductDetailClient
        product={product}
        subdomain={subdomain}
        relatedProducts={relatedProducts}
      />
    </StorePageShell>
  );
}
